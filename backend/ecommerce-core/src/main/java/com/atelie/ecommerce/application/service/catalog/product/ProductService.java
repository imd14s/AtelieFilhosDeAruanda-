package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
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
            // Atribui o nome da categoria como String no produto
            product.setCategory(category.getName());
        }
        return productRepository.save(product);
    }

    public List<ProductEntity> getAllActiveProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getActive() != null && p.getActive())
                .toList();
    }

    public void deleteProduct(UUID id) {
        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        entity.setActive(false);
        productRepository.save(entity);
    }
}
