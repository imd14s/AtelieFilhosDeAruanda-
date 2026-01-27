package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products") // Prefixo /api restaurado
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductEntity> createProduct(@RequestBody ProductEntity product, @RequestParam(required = false) UUID categoryId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.saveProduct(product, categoryId));
    }

    @GetMapping
    public List<ProductEntity> listAll() {
        return productService.getAllActiveProducts();
    }
}
