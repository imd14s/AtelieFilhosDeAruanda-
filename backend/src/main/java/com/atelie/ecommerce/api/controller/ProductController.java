package com.atelie.ecommerce.api.controller;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.auth.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // LISTAR TODOS (Garante retorno de ARRAY JSON)
    @GetMapping
    public ResponseEntity<List<ProductEntity>> getAll() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CRIAR
    @PostMapping
    public ResponseEntity<ProductEntity> create(@RequestBody ProductEntity product) {
        if (product.getId() == null) {
            product.setId(UUID.randomUUID());
        }
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        if (product.getActive() == null) product.setActive(true);
        
        return ResponseEntity.ok(productRepository.save(product));
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<ProductEntity> update(@PathVariable UUID id, @RequestBody ProductEntity productDetails) {
        return productRepository.findById(id)
            .map(existing -> {
                existing.setName(productDetails.getName());
                existing.setDescription(productDetails.getDescription());
                existing.setPrice(productDetails.getPrice());
                existing.setStockQuantity(productDetails.getStockQuantity());
                existing.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(productRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
