package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateVariantRequest;
import com.atelie.ecommerce.application.service.catalog.product.ProductVariantService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductVariantController {

    private final ProductVariantService service;

    public ProductVariantController(ProductVariantService service) {
        this.service = service;
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ProductVariantEntity> create(
            @PathVariable UUID productId,
            @RequestBody @Valid CreateVariantRequest request) {
        return ResponseEntity.ok(service.create(productId, request));
    }

    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<ProductVariantEntity>> list(@PathVariable UUID productId) {
        return ResponseEntity.ok(service.listByProduct(productId));
    }
}
