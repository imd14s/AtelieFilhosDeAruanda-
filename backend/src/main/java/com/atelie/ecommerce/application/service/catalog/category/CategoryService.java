package com.atelie.ecommerce.application.service.catalog.category;

import com.atelie.ecommerce.application.dto.catalog.category.CategoryResponse;
import com.atelie.ecommerce.application.dto.catalog.category.CreateCategoryRequest;
import com.atelie.ecommerce.application.common.exception.DuplicateResourceException;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @CacheEvict(value = { "categories", "sitemap" }, allEntries = true)
    public CategoryResponse create(CreateCategoryRequest request) {
        // Validar se já existe categoria com o mesmo nome
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException(
                    "Já existe uma categoria com o nome '" + request.getName() + "'");
        }

        CategoryEntity entity = new CategoryEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(request.getName());
        entity.setActive(request.getActive() != null ? request.getActive() : true);

        repository.save(entity);

        return new CategoryResponse(entity.getId(), entity.getName(), entity.getActive());
    }

    @Cacheable("categories")
    public List<CategoryResponse> list() {
        return repository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getActive()))
                .toList();
    }

    @CacheEvict(value = { "categories", "sitemap" }, allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new com.atelie.ecommerce.application.common.exception.NotFoundException("Categoria não encontrada.");
        }
        try {
            repository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new com.atelie.ecommerce.application.common.exception.DuplicateResourceException(
                    "Não é possível excluir a categoria pois existem produtos associados a ela.");
        }
    }
}
