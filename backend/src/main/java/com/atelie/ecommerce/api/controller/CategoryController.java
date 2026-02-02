package com.atelie.ecommerce.api.controller;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryEntity>> listCategories() {
        // Retorna todas as categorias ativas do banco
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}
