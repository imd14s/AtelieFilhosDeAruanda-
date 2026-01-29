package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository; // Injetado para criar default
    private final ApplicationEventPublisher eventPublisher;
    private final GtinGeneratorService gtinGenerator; // Para gerar EAN da variante default

    public ProductService(ProductRepository productRepository, 
                          CategoryRepository categoryRepository,
                          ProductVariantRepository variantRepository,
                          ApplicationEventPublisher eventPublisher,
                          GtinGeneratorService gtinGenerator) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.eventPublisher = eventPublisher;
        this.gtinGenerator = gtinGenerator;
    }

    @Transactional
    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        boolean isNew = (product.getId() == null);
        
        if (categoryId != null) {
            CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
            product.setCategoryId(category.getId());
        }
        
        ProductEntity saved = productRepository.save(product);
        
        // --- CORREÇÃO: Cria Variante Default se for produto novo ---
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
                .price(product.getPrice())
                .stockQuantity(0) // Começa zerado, admin ajusta depois
                .active(true)
                .attributesJson("{\"default\": true}")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        variantRepository.save(defaultVariant);
    }

    public Page<ProductEntity> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    public ProductEntity findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public void deleteProduct(UUID id) {
        ProductEntity entity = findById(id);
        entity.setActive(false);
        productRepository.save(entity);
    }
}
