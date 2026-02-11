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
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository; // New dependency
    private final GtinGeneratorService gtinGenerator; // New dependency
    private final DynamicConfigService configService;
    private final ApplicationEventPublisher eventPublisher;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductVariantRepository variantRepository,
            GtinGeneratorService gtinGenerator,
            DynamicConfigService configService,
            ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.gtinGenerator = gtinGenerator;
        this.configService = configService;
        this.eventPublisher = eventPublisher;
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
        return saved;
    }

    // Legacy support for calls without variants
    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        return saveProduct(product, categoryId, null);
    }

    private void createDefaultVariant(ProductEntity product) {
        ProductVariantEntity defaultVariant = ProductVariantEntity.builder()
                .product(product)
                .sku("SKU-" + product.getId().toString().substring(0, 8).toUpperCase())
                .gtin(gtinGenerator.generateInternalEan13())
                .price(null)
                .stockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                .active(true)
                .attributesJson("{\"default\": true}")
                .build();

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

        existing.setUpdatedAt(java.time.LocalDateTime.now());
        ProductEntity saved = productRepository.save(existing);
        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), false));
        return saved;
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
}