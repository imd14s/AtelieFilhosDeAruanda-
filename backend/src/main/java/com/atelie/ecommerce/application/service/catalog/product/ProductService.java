package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationFactory;
import com.atelie.ecommerce.application.service.ai.GeminiIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import com.atelie.ecommerce.infrastructure.service.media.CloudinaryService;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;

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
            CloudinaryService cloudinaryService) {
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

        ProductEntity saved = productRepository.save(product);
        saveOrUpdateVariants(saved, variants, isNew);

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), isNew));
        syncMarketplaces(saved);
        return saved;
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductEntity updateProduct(UUID id, ProductEntity details, List<ProductVariantEntity> variants,
            MultipartFile[] images) {
        ProductEntity existing = findById(id);
        Set<String> oldUrls = collectAllImageUrls(existing);
        Set<ServiceProviderEntity> oldMarketplaces = new HashSet<>(existing.getMarketplaces());

        Map<String, String> cidMap = uploadAndMapImages(images);
        sanitizeAndMapEntityImages(details, variants, cidMap);

        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        existing.setPrice(details.getPrice());
        existing.setStockQuantity(details.getStockQuantity());
        existing.setWeight(details.getWeight());
        existing.setHeight(details.getHeight());
        existing.setWidth(details.getWidth());
        existing.setLength(details.getLength());
        existing.setNcm(details.getNcm());
        existing.setProductionType(details.getProductionType());
        existing.setOrigin(details.getOrigin());
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
        }

        Set<String> newUrls = collectAllImageUrls(existing);
        oldUrls.stream()
                .filter(url -> !newUrls.contains(url))
                .forEach(this::deleteImageFromCloudinary);

        existing.setUpdatedAt(LocalDateTime.now());
        ProductEntity saved = productRepository.save(existing);

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), false));

        // Sincroniza adições (envia para novos) e deleções (remove dos velhos)
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
                existingVariant.setSku(v.getSku());
                existingVariant.setPrice(
                        (v.getPrice() == null || v.getPrice().compareTo(BigDecimal.ZERO) <= 0) ? existing.getPrice()
                                : v.getPrice());
                existingVariant.setStockQuantity(v.getStockQuantity());
                existingVariant.setAttributesJson(v.getAttributesJson());
                existingVariant.setImageUrl(v.getImageUrl());
                existingVariant.setOriginalPrice(v.getOriginalPrice());
                if (v.getImages() != null)
                    existingVariant.setImages(new ArrayList<>(v.getImages()));
                existingVariant.setActive(v.getActive());
                existingVariant.setUpdatedAt(LocalDateTime.now());
                toKeep.add(existingVariant);
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
}