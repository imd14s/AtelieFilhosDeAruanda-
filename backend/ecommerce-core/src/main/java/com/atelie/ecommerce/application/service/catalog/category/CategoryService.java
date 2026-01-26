package com.atelie.ecommerce.application.service.catalog.category;

import com.atelie.ecommerce.api.catalog.category.dto.CategoryResponse;
import com.atelie.ecommerce.api.catalog.category.dto.CreateCategoryRequest;
import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public CategoryResponse create(CreateCategoryRequest request) {
        boolean exists = repository.findAll().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(request.getName()));

        if (exists) {
            throw new ConflictException("Category already exists");
        }

        CategoryEntity entity = new CategoryEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(request.getName());
        entity.setActive(request.getActive());

        repository.save(entity);

        return new CategoryResponse(entity.getId(), entity.getName(), entity.getActive());
    }

    public List<CategoryResponse> list() {
        return repository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getActive()))
                .toList();
    }
}
