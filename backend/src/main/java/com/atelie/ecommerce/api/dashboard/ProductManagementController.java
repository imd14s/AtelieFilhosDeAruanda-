package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/products")
public class ProductManagementController {

    private final ProductRepository productRepository;

    public ProductManagementController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductResponse> listAll() {
        // Converte Entity para DTO antes de retornar
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Simplificado para Dashboard (admin vê tudo)
    private ProductResponse toResponse(ProductEntity entity) {
        var response = new ProductResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getCategoryId(),
                entity.getActive()
        );
        response.setImageUrl(entity.getImageUrl());
        return response;
    }

    @PutMapping("/{id}/toggle-alert")
    public ResponseEntity<ProductResponse> toggleAlert(@PathVariable UUID id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        product.setAlertEnabled(!Boolean.TRUE.equals(product.getAlertEnabled()));
        ProductEntity saved = productRepository.save(product);
        return ResponseEntity.ok(toResponse(saved));
    }
}
