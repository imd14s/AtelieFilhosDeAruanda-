package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationFactory;
import com.atelie.ecommerce.application.service.ai.GeminiIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import com.atelie.ecommerce.infrastructure.service.media.CloudinaryService;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.StockMovementEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.StockMovementRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final GtinGeneratorService gtinGenerator;
    private final ServiceProviderJpaRepository providerRepository;
    private final DynamicConfigService configService;
    private final ApplicationEventPublisher eventPublisher;
    private final MarketplaceIntegrationFactory marketplaceFactory;
    private final MarketplaceIntegrationRepository marketplaceRepository;
    private final GeminiIntegrationService geminiIntegrationService;
    private final CloudinaryService cloudinaryService;
    private final StockMovementRepository stockMovementRepository;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductVariantRepository variantRepository,
            GtinGeneratorService gtinGenerator,
            ServiceProviderJpaRepository providerRepository,
            DynamicConfigService configService,
            ApplicationEventPublisher eventPublisher,
            MarketplaceIntegrationFactory marketplaceFactory,
            MarketplaceIntegrationRepository marketplaceRepository,
            GeminiIntegrationService geminiIntegrationService,
            CloudinaryService cloudinaryService,
            StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.gtinGenerator = gtinGenerator;
        this.providerRepository = providerRepository;
        this.configService = configService;
        this.eventPublisher = eventPublisher;
        this.marketplaceFactory = marketplaceFactory;
        this.marketplaceRepository = marketplaceRepository;
        this.geminiIntegrationService = geminiIntegrationService;
        this.cloudinaryService = cloudinaryService;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductEntity findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with ID: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId, List<ProductVariantEntity> variants,
            MultipartFile[] images) {

        Map<String, String> cidMap = uploadAndMapImages(images);

        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Categoria com ID " + categoryId + " não foi encontrada"));
        product.setCategory(category);

        boolean isNew = product.getId() == null;
        if (isNew)
            product.setId(UUID.randomUUID());

        sanitizeAndMapEntityImages(product, variants, cidMap);
        handleMarketplaces(product);

        // Se for novo e não tiver variantes, garante estoque >= 0
        if (isNew && product.getStockQuantity() != null && product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Estoque não pode ser negativo");
        }

        ProductEntity saved = productRepository.save(product);
        saveOrUpdateVariants(saved, variants, isNew);

        // Sincroniza estoque pai e grava log inicial se necessário
        updateParentStockFromVariants(saved);
        productRepository.save(saved);

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), isNew));
        syncMarketplaces(saved);

        if (isNew) {
            recordStockMovement(saved.getId(), null, saved.getStockQuantity(), saved.getStockQuantity(), "INITIAL_LOAD",
                    "Produto criado");
        }

        return saved;
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductEntity updateProduct(UUID id, ProductEntity details, List<ProductVariantEntity> variants,
            MultipartFile[] images) {
        // Usa LOCK PESSIMISTA para evitar condições de corrida no estoque
        ProductEntity existing = productRepository.findByIdWithLock(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado: " + id));

        int oldStock = existing.getStockQuantity() != null ? existing.getStockQuantity() : 0;
        Set<String> oldUrls = collectAllImageUrls(existing);
        Set<ServiceProviderEntity> oldMarketplaces = new HashSet<>(existing.getMarketplaces());

        Map<String, String> cidMap = uploadAndMapImages(images);
        sanitizeAndMapEntityImages(details, variants, cidMap);

        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        existing.setPrice(details.getPrice());
        existing.setWeight(details.getWeight());
        existing.setHeight(details.getHeight());
        existing.setWidth(details.getWidth());
        existing.setLength(details.getLength());
        existing.setImages(details.getImages());

        if (details.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(details.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada: " + details.getCategoryId()));
            existing.setCategory(category);
        }

        if (details.getMarketplaceIds() != null) {
            Set<ServiceProviderEntity> providers = new HashSet<>(
                    providerRepository.findAllById(details.getMarketplaceIds()));
            existing.setMarketplaces(providers);
        }

        if (variants != null) {
            updateVariants(existing, variants);
        } else {
            // Se não houver variantes na request, atualiza o estoque direto (se fornecido)
            if (details.getStockQuantity() != null) {
                if (details.getStockQuantity() < 0)
                    throw new IllegalArgumentException("Estoque negativo proibido");
                existing.setStockQuantity(details.getStockQuantity());
            }
        }

        // Sincroniza estoque pai a partir das variantes (se houver)
        updateParentStockFromVariants(existing);

        Set<String> newUrls = collectAllImageUrls(existing);
        oldUrls.stream()
                .filter(url -> !newUrls.contains(url))
                .forEach(this::deleteImageFromCloudinary);

        existing.setUpdatedAt(LocalDateTime.now());
        ProductEntity saved = productRepository.save(existing);

        // Auditoria
        int newStock = saved.getStockQuantity() != null ? saved.getStockQuantity() : 0;
        if (oldStock != newStock) {
            recordStockMovement(saved.getId(), null, newStock - oldStock, newStock, "ADJUSTMENT",
                    "Atualização manual via dashboard");
        }

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), false));
        handleRemovedMarketplaces(oldMarketplaces, saved);
        syncMarketplaces(saved);

        return saved;
    }

    private void handleRemovedMarketplaces(Set<ServiceProviderEntity> oldMarketplaces, ProductEntity currentProduct) {
        if (oldMarketplaces == null || currentProduct.getMarketplaces() == null) {
            return;
        }

        Set<String> currentProviderCodes = currentProduct.getMarketplaces().stream()
                .map(p -> p.getCode().toLowerCase())
                .collect(Collectors.toSet());

        for (ServiceProviderEntity oldProvider : oldMarketplaces) {
            if (!currentProviderCodes.contains(oldProvider.getCode().toLowerCase())) {
                log.info("Desativando produto {} no canal removido: {}", currentProduct.getId(), oldProvider.getCode());
                try {
                    List<MarketplaceIntegrationEntity> integrations = marketplaceRepository
                            .findAllByProvider(oldProvider.getCode().toLowerCase());
                    for (MarketplaceIntegrationEntity integration : integrations) {
                        if (integration.isActive()) {
                            marketplaceFactory.getAdapter(integration.getProvider())
                                    .ifPresent(adapter -> adapter.removeProduct(currentProduct, integration));
                        }
                    }
                } catch (Exception e) {
                    log.error("Erro ao remover produto do canal remoto {}", oldProvider.getCode(), e);
                }
            }
        }
    }

    private Map<String, String> uploadAndMapImages(MultipartFile[] images) {
        Map<String, String> cidMap = new HashMap<>();
        if (images != null) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    String cid = img.getOriginalFilename();
                    String url = cloudinaryService.upload(img);
                    cidMap.put(cid, url);
                }
            }
        }
        return cidMap;
    }

    private void sanitizeAndMapEntityImages(ProductEntity product, List<ProductVariantEntity> variants,
            Map<String, String> cidMap) {
        if (product.getImages() != null) {
            product.setImages(sanitizeUrlList(product.getImages(), cidMap));
        }

        if (variants != null) {
            for (ProductVariantEntity v : variants) {
                if (v.getImageUrl() != null) {
                    v.setImageUrl(replaceCid(v.getImageUrl(), cidMap));
                }
                if (v.getImages() != null) {
                    v.setImages(sanitizeUrlList(v.getImages(), cidMap));
                }
            }
        }
    }

    private List<String> sanitizeUrlList(List<String> urls, Map<String, String> cidMap) {
        return urls.stream()
                .filter(url -> !url.startsWith("blob:") && !url.startsWith("data:"))
                .map(url -> replaceCid(url, cidMap))
                .filter(url -> !url.startsWith("cid:"))
                .collect(Collectors.toList());
    }

    private String replaceCid(String url, Map<String, String> cidMap) {
        if (url != null && url.startsWith("cid:")) {
            String cid = url.substring(4);
            return cidMap.getOrDefault(cid, url);
        }
        return url;
    }

    private Set<String> collectAllImageUrls(ProductEntity p) {
        Set<String> urls = new HashSet<>();
        if (p.getImages() != null)
            urls.addAll(p.getImages());
        if (p.getVariants() != null) {
            for (var v : p.getVariants()) {
                if (v.getImageUrl() != null)
                    urls.add(v.getImageUrl());
                if (v.getImages() != null)
                    urls.addAll(v.getImages());
            }
        }
        return urls;
    }

    private void handleMarketplaces(ProductEntity product) {
        if (product.getMarketplaceIds() != null && !product.getMarketplaceIds().isEmpty()) {
            Set<ServiceProviderEntity> providers = new HashSet<>(
                    providerRepository.findAllById(product.getMarketplaceIds()));
            product.setMarketplaces(providers);
        } else {
            providerRepository.findByCode("LOJA_VIRTUAL").ifPresent(provider -> {
                product.setMarketplaces(Collections.singleton(provider));
            });
        }
    }

    private void saveOrUpdateVariants(ProductEntity saved, List<ProductVariantEntity> variants, boolean isNew) {
        if (variants != null && !variants.isEmpty()) {
            for (ProductVariantEntity variant : variants) {
                variant.setProduct(saved);
                if (variant.getSku() == null || variant.getSku().isBlank()) {
                    variant.setSku("SKU-" + saved.getId().toString().substring(0, 8).toUpperCase() + "-"
                            + UUID.randomUUID().toString().substring(0, 4));
                }
                if (variant.getGtin() == null) {
                    variant.setGtin(gtinGenerator.generateInternalEan13());
                }
                if (variant.getPrice() == null || variant.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                    variant.setPrice(saved.getPrice());
                }
                if (variant.getStockQuantity() == null)
                    variant.setStockQuantity(0);
                if (variant.getStockQuantity() < 0)
                    throw new IllegalArgumentException("Estoque de variante negativo");

                variantRepository.save(variant);
            }
        } else if (isNew) {
            createDefaultVariant(saved);
        }
    }

    private void createDefaultVariant(ProductEntity product) {
        ProductVariantEntity defaultVariant = new ProductVariantEntity(
                product,
                "SKU-" + product.getId().toString().substring(0, 8).toUpperCase(),
                gtinGenerator.generateInternalEan13(),
                null,
                product.getStockQuantity() != null ? product.getStockQuantity() : 0,
                "{\"default\": true}",
                true);
        variantRepository.save(defaultVariant);
    }

    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId, List<ProductVariantEntity> variants) {
        return saveProduct(product, categoryId, variants, null);
    }

    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        return saveProduct(product, categoryId, null);
    }

    @Transactional
    public ProductEntity updateProduct(UUID id, ProductEntity details, List<ProductVariantEntity> variants) {
        return updateProduct(id, details, variants, null);
    }

    @Transactional
    public ProductEntity updateProduct(UUID id, ProductEntity details) {
        return updateProduct(id, details, null);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void deleteProduct(UUID id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado com ID: " + id));

        if (product.getVariants() != null) {
            for (var variant : product.getVariants()) {
                if (variant.getImageUrl() != null)
                    deleteImageFromCloudinary(variant.getImageUrl());
                if (variant.getImages() != null)
                    variant.getImages().forEach(this::deleteImageFromCloudinary);
            }
        }

        if (product.getImages() != null) {
            product.getImages().forEach(this::deleteImageFromCloudinary);
        }

        productRepository.delete(product);
    }

    private void deleteImageFromCloudinary(String url) {
        String publicId = cloudinaryService.extractPublicId(url);
        if (publicId != null) {
            try {
                cloudinaryService.delete(publicId);
            } catch (Exception e) {
                log.error("Falha ao deletar imagem do Cloudinary: {}", publicId, e);
            }
        }
    }

    private void updateVariants(ProductEntity existing, List<ProductVariantEntity> newVariants) {
        if (existing.getVariants() == null) {
            existing.setVariants(new ArrayList<>());
        }

        Map<UUID, ProductVariantEntity> existingMap = existing.getVariants().stream()
                .filter(v -> v.getId() != null)
                .collect(Collectors.toMap(ProductVariantEntity::getId, v -> v, (v1, v2) -> v1));

        List<ProductVariantEntity> toKeep = new ArrayList<>();
        List<ProductVariantEntity> toAdd = new ArrayList<>();

        for (ProductVariantEntity v : newVariants) {
            if (v.getId() != null && existingMap.containsKey(v.getId())) {
                ProductVariantEntity existingVariant = existingMap.get(v.getId());

                int oldVStock = existingVariant.getStockQuantity() != null ? existingVariant.getStockQuantity() : 0;
                int newVStock = v.getStockQuantity() != null ? v.getStockQuantity() : 0;

                existingVariant.setSku(v.getSku());
                existingVariant.setPrice(
                        (v.getPrice() == null || v.getPrice().compareTo(BigDecimal.ZERO) <= 0) ? existing.getPrice()
                                : v.getPrice());
                existingVariant.setStockQuantity(newVStock);
                existingVariant.setAttributesJson(v.getAttributesJson());
                existingVariant.setImageUrl(v.getImageUrl());
                existingVariant.setOriginalPrice(v.getOriginalPrice());
                if (v.getImages() != null)
                    existingVariant.setImages(new ArrayList<>(v.getImages()));
                existingVariant.setActive(v.getActive());
                existingVariant.setUpdatedAt(LocalDateTime.now());
                toKeep.add(existingVariant);

                if (oldVStock != newVStock) {
                    recordStockMovement(existing.getId(), v.getId(), newVStock - oldVStock, newVStock, "ADJUSTMENT",
                            "Ajuste de variante manual");
                }
            } else {
                v.setProduct(existing);
                if (v.getId() == null)
                    v.setId(UUID.randomUUID());
                v.setCreatedAt(LocalDateTime.now());
                v.setUpdatedAt(LocalDateTime.now());
                if (v.getStockQuantity() == null)
                    v.setStockQuantity(0);
                if (v.getActive() == null)
                    v.setActive(true);
                if (v.getSku() == null || v.getSku().isBlank()) {
                    v.setSku("SKU-" + existing.getId().toString().substring(0, 8).toUpperCase() + "-"
                            + UUID.randomUUID().toString().substring(0, 4));
                }
                if (v.getGtin() == null)
                    v.setGtin(gtinGenerator.generateInternalEan13());
                if (v.getPrice() == null || v.getPrice().compareTo(BigDecimal.ZERO) <= 0)
                    v.setPrice(existing.getPrice());
                toAdd.add(v);

                recordStockMovement(existing.getId(), v.getId(), v.getStockQuantity(), v.getStockQuantity(),
                        "ADJUSTMENT", "Nova variante adicionada");
            }
        }

        existing.getVariants().retainAll(toKeep);
        existing.getVariants().addAll(toAdd);
    }

    @Transactional
    public void toggleAlert(UUID id) {
        ProductEntity product = findById(id);
        boolean current = product.getAlertEnabled() != null ? product.getAlertEnabled() : false;
        product.setAlertEnabled(!current);
        productRepository.save(product);
    }

    public String generateDescription(String title, String imageUrl) {
        return geminiIntegrationService.generateProductInfo(title, imageUrl).get("description");
    }

    public Map<String, String> generateProductInfo(String title, String imageUrl) {
        return geminiIntegrationService.generateProductInfo(title, imageUrl);
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> searchProducts(String query, Pageable pageable) {
        // Full-text search com stemming pt-BR (velas → vela, ervas → erva)
        Page<ProductEntity> results = productRepository.fullTextSearch(query, pageable);
        // Fallback: busca parcial por substring caso o full-text não retorne resultados
        if (results.isEmpty()) {
            results = productRepository.findByNameContainingIgnoreCase(query, pageable);
        }
        return results;
    }

    private void syncMarketplaces(ProductEntity product) {
        if (product.getMarketplaces() == null)
            return;
        for (ServiceProviderEntity provider : product.getMarketplaces()) {
            try {
                List<MarketplaceIntegrationEntity> integrations = marketplaceRepository
                        .findAllByProvider(provider.getCode().toLowerCase());
                for (MarketplaceIntegrationEntity integration : integrations) {
                    if (integration.isActive()) {
                        marketplaceFactory.getAdapter(integration.getProvider())
                                .ifPresent(adapter -> adapter.exportProduct(product, integration));
                    }
                }
            } catch (Exception e) {
                log.error("Error syncing to marketplace {}", provider.getCode(), e);
            }
        }
    }

    private void recordStockMovement(UUID productId, UUID variantId, Integer change, Integer result, String type,
            String reason) {
        StockMovementEntity movement = StockMovementEntity.builder()
                .productId(productId)
                .variantId(variantId)
                .quantityChange(change)
                .resultingStock(result)
                .movementType(type)
                .reason(reason)
                .createdBy("SYSTEM_ADMIN")
                .build();
        stockMovementRepository.save(movement);
    }

    private void updateParentStockFromVariants(ProductEntity product) {
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            int totalStock = product.getVariants().stream()
                    .filter(v -> v.getActive() != null && v.getActive())
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
            product.setStockQuantity(totalStock);
        }
    }
}