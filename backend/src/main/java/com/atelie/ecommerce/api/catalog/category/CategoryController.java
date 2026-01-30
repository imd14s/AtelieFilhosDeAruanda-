package com.atelie.ecommerce.api.catalog.category;

import com.atelie.ecommerce.api.catalog.category.dto.CreateCategoryRequest;
import com.atelie.ecommerce.api.catalog.category.dto.CategoryResponse;
import com.atelie.ecommerce.application.service.catalog.category.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CreateCategoryRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return service.list();
    }
}
