package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity; // Import
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository; // Import
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository; // New dependency
    private final GtinGeneratorService gtinGenerator;         // New dependency
    private final ApplicationEventPublisher eventPublisher;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductVariantRepository variantRepository,
                          GtinGeneratorService gtinGenerator,
                          ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.gtinGenerator = gtinGenerator;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public ProductEntity findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with ID: " + id));
    }

    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with ID: " + categoryId));
        product.setCategory(category);
        
        boolean isNew = product.getId() == null;
        if (isNew) {
            product.setId(UUID.randomUUID()); // Ensure ID is generated before saving variant
        }

        ProductEntity saved = productRepository.save(product);

        // --- CRITICAL FIX: Create Default Variant for New Products ---
        if (isNew) {
            createDefaultVariant(saved);
        }

        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), isNew));
        return saved;
    }

    private void createDefaultVariant(ProductEntity product) {
        ProductVariantEntity defaultVariant = ProductVariantEntity.builder()
                .product(product)
                .sku("SKU-" + product.getId().toString().substring(0, 8).toUpperCase())
                .gtin(gtinGenerator.generateInternalEan13())
                .price(null) // Null means "inherit from parent"
                .stockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                .active(true)
                .attributesJson("{\"default\": true}")
                .build();
        
        variantRepository.save(defaultVariant);
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }
}