package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard/products")
public class ProductManagementController {

    private final ProductRepository productRepository;

    public ProductManagementController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductEntity> listAll() {
        return productRepository.findAll();
    }

    @PostMapping
    public ProductEntity create(@RequestBody ProductEntity product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}/toggle-alert")
    public ResponseEntity<ProductEntity> toggleAlert(@PathVariable UUID id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        product.setAlertEnabled(!product.getAlertEnabled());
        return ResponseEntity.ok(productRepository.save(product));
    }
}
