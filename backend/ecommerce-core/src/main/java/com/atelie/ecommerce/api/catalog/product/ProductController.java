package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductEntity> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductEntity product = new ProductEntity();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setActive(request.getActive());
        
        // Força ID nulo para segurança (insert)
        product.setId(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.saveProduct(product, request.getCategoryId()));
    }

    @GetMapping
    public Page<ProductEntity> listAll(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return productService.getAllActiveProducts(pageable);
    }
}
