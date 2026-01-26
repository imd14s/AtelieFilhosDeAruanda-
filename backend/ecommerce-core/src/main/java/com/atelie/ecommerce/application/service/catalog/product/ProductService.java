package com.atelie.ecommerce.application.service.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
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

    public ProductResponse create(CreateProductRequest request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        ProductEntity entity = new ProductEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setPrice(request.getPrice());
        entity.setCategory(category);
        entity.setActive(request.getActive());

        productRepository.save(entity);

        return new ProductResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getCategory().getId(),
                entity.getActive()
        );
    }
}
