package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
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
    private final ApplicationEventPublisher eventPublisher;

    public ProductService(ProductRepository productRepository, 
                          CategoryRepository categoryRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.eventPublisher = eventPublisher;
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
        
        // --- NOVO: Publica evento para o ecossistema ---
        eventPublisher.publishEvent(new ProductSavedEvent(saved.getId(), isNew));
        
        return saved;
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
