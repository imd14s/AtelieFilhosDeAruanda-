package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity; // Import
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository; // Import
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.common.exception.BusinessException;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationFactory;
import com.atelie.ecommerce.application.integration.IMarketplaceAdapter;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.integration.repository.MarketplaceIntegrationRepository;
import lombok.extern.slf4j.Slf4j; // Add logging

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.math.BigDecimal;

@Service
public class ProductService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository; // New dependency
    private final GtinGeneratorService gtinGenerator; // New dependency
    private final com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository providerRepository;
    private final DynamicConfigService configService;
    private final ApplicationEventPublisher eventPublisher;
    private final MarketplaceIntegrationFactory marketplaceFactory;
    private final MarketplaceIntegrationRepository marketplaceRepository;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductVariantRepository variantRepository,
            GtinGeneratorService gtinGenerator,
            com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository providerRepository,
            DynamicConfigService configService,
            ApplicationEventPublisher eventPublisher,
            MarketplaceIntegrationFactory marketplaceFactory,
            MarketplaceIntegrationRepository marketplaceRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.gtinGenerator = gtinGenerator;
        this.providerRepository = providerRepository;
        this.configService = configService;
        this.eventPublisher = eventPublisher;
        this.marketplaceFactory = marketplaceFactory;
        this.marketplaceRepository = marketplaceRepository;
    }

    @Transactional(readOnly = true)
    public ProductEntity findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with ID: " + id));
    }

    /**
     * Saves a product and its variants.
     * If variants list is empty/null for a NEW product, a default variant is
     * created.
     */
    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId, List<ProductVariantEntity> variants) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException(
                        "Categoria com ID " + categoryId + " não foi encontrada"));
        product.setCategory(category);

        boolean isNew = product.getId() == null;
        if (isNew) {
            product.setId(UUID.randomUUID());
        }

        // Handle Marketplaces (Create)
        if (product.getMarketplaceIds() != null) {
            java.util.Set<com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity> providers = new java.util.HashSet<>(
                    providerRepository.findAllById(product.getMarketplaceIds()));
            product.setMarketplaces(providers);
        }

        ProductEntity saved = productRepository.save(product);

        // Handle Variants
        if (variants != null && !variants.isEmpty()) {
            for (ProductVariantEntity variant : variants) {
                variant.setProduct(saved);
                if (variant.getSku() == null || variant.getSku().isBlank()) {
                    variant.setSku("SKU-" + saved.getId().toString().substring(0, 8).toUpperCase() + "-"
                            + java.util.UUID.randomUUID().toString().substring(0, 4));
                }
                if (variant.getGtin() == null) {
                    variant.setGtin(gtinGenerator.generateInternalEan13());
                }
                // Ensure defaults
                if (variant.getStockQuantity() == null)
                    variant.setStockQuantity(0);
                if (variant.getActive() == null)
                    variant.setActive(true);

                variantRepository.save(variant);
            }
        } else if (isNew) {
            // Only create default if no variants provided
            createDefaultVariant(saved);
        }

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), isNew));
        syncMarketplaces(saved);
        return saved;
    }

    // Legacy support for calls without variants
    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        return saveProduct(product, categoryId, null);
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
    public ProductEntity updateProduct(UUID id, ProductEntity details) {
        ProductEntity existing = findById(id);

        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        existing.setPrice(details.getPrice());
        existing.setStockQuantity(details.getStockQuantity());

        if (details.getImages() != null) {
            existing.setImages(details.getImages());
        }

        // Handle Category Update
        if (details.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(details.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada: " + details.getCategoryId()));
            existing.setCategory(category);
        }

        // Handle Marketplaces (Update)
        if (details.getMarketplaceIds() != null) {
            java.util.Set<com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity> providers = new java.util.HashSet<>(
                    providerRepository.findAllById(details.getMarketplaceIds()));
            existing.setMarketplaces(providers);
        }

        // Handle Variants Update
        if (details.getVariants() != null) {
            updateVariants(existing, details.getVariants());
        }

        existing.setUpdatedAt(java.time.LocalDateTime.now());
        ProductEntity saved = productRepository.save(existing);
        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), false));
        syncMarketplaces(saved);
        return saved;
    }

    private void updateVariants(ProductEntity existing, List<ProductVariantEntity> newVariants) {
        java.util.Map<UUID, ProductVariantEntity> existingMap = existing.getVariants().stream()
                .collect(java.util.stream.Collectors.toMap(ProductVariantEntity::getId, v -> v));

        java.util.List<ProductVariantEntity> toAdd = new ArrayList<>();
        java.util.List<UUID> toKeep = new ArrayList<>();

        for (ProductVariantEntity v : newVariants) {
            if (v.getId() != null && existingMap.containsKey(v.getId())) {
                // Update existing
                ProductVariantEntity existingVariant = existingMap.get(v.getId());
                existingVariant.setSku(v.getSku());
                existingVariant.setPrice(v.getPrice());
                existingVariant.setStockQuantity(v.getStockQuantity());
                existingVariant.setAttributesJson(v.getAttributesJson());
                existingVariant.setImageUrl(v.getImageUrl());
                existingVariant.setActive(v.getActive());
                existingVariant.setUpdatedAt(java.time.LocalDateTime.now());
                toKeep.add(v.getId());
            } else {
                // New variant
                v.setProduct(existing);
                if (v.getId() == null) {
                    v.setId(UUID.randomUUID());
                }
                if (v.getCreatedAt() == null) {
                    v.setCreatedAt(java.time.LocalDateTime.now());
                }
                v.setUpdatedAt(java.time.LocalDateTime.now());

                // Ensure defaults for new variants
                if (v.getStockQuantity() == null)
                    v.setStockQuantity(0);
                if (v.getActive() == null)
                    v.setActive(true);
                if (v.getSku() == null || v.getSku().isBlank()) {
                    v.setSku("SKU-" + existing.getId().toString().substring(0, 8).toUpperCase() + "-"
                            + java.util.UUID.randomUUID().toString().substring(0, 4));
                }
                if (v.getGtin() == null) {
                    v.setGtin(gtinGenerator.generateInternalEan13());
                }

                toAdd.add(v);
            }
        }

        // Remove those not in toKeep
        existing.getVariants().removeIf(v -> !toKeep.contains(v.getId()));

        // Add new
        existing.getVariants().addAll(toAdd);
    }

    @Transactional
    public void toggleAlert(UUID id) {
        ProductEntity product = findById(id);
        boolean current = product.getAlertEnabled() != null ? product.getAlertEnabled() : false;
        product.setAlertEnabled(!current);
        productRepository.save(product);
    }

    public String generateDescription(String title) {
        String token = configService.getString("OPENAI_API_TOKEN");
        if (token == null || token.isBlank()) {
            throw new BusinessException("Token OpenAI não configurado no sistema.");
        }

        // Mock implementation until real OpenAI integration
        // In real scenario, would call OpenAI API here using the token
        try {
            // Simulate network delay
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return "Descrição gerada por IA para: " + title + "\n\n" +
                "Este é um produto exclusivo do Ateliê Filhos de Aruanda. " +
                "Feito com dedicação e materiais de alta qualidade para garantir " +
                "beleza e durabilidade. Axé!";
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> searchProducts(String query, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(query, pageable);
    }

    private void syncMarketplaces(ProductEntity product) {
        if (product.getMarketplaces() == null || product.getMarketplaces().isEmpty()) {
            return;
        }

        for (com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity provider : product
                .getMarketplaces()) {
            try {
                Optional<MarketplaceIntegrationEntity> integrationOpt = marketplaceRepository
                        .findByProvider(provider.getCode().toLowerCase());

                if (integrationOpt.isPresent()) {
                    MarketplaceIntegrationEntity integration = integrationOpt.get();
                    if (integration.isActive()) {
                        marketplaceFactory.getAdapter(integration.getProvider())
                                .ifPresent(adapter -> adapter.exportProduct(product, integration));
                    }
                } else {
                    // Assuming 'log' is defined elsewhere, e.g., private static final Logger log =
                    // LoggerFactory.getLogger(ProductService.class);
                    // If not, this line will cause a compilation error.
                    log.warn("No integration record found for provider {}", provider.getCode());
                }
            } catch (Exception e) {
                // Assuming 'log' is defined elsewhere
                log.error("Error syncing to marketplace {}", provider.getCode(), e);
            }
        }
    }
}