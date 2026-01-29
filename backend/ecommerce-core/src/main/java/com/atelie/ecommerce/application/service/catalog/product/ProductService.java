package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductEntity saveProduct(ProductEntity product, UUID categoryId) {
        if (categoryId != null) {
            CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
            product.setCategoryId(category.getId());
        }
        return productRepository.save(product);
    }

    public Page<ProductEntity> getAllActiveProducts(Pageable pageable) {
        // PERFORMANCE: Retorna apenas a "fatia" solicitada pelo frontend
        return productRepository.findByActiveTrue(pageable);
    }

    public void deleteProduct(UUID id) {
        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        entity.setActive(false);
        productRepository.save(entity);
    }
}
