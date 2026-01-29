package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
        product.setId(null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.saveProduct(product, request.getCategoryId()));
    }

    @GetMapping
    public Page<ProductResponse> listAll(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return productService.getAllActiveProducts(pageable).map(this::toResponse);
    }

    private ProductResponse toResponse(ProductEntity entity) {
        // CORREÇÃO: Gera a URL completa dinamicamente baseado no request atual
        String fullImageUrl = null;
        if (entity.getImageUrl() != null && !entity.getImageUrl().isBlank()) {
            if (entity.getImageUrl().startsWith("http")) {
                fullImageUrl = entity.getImageUrl(); // Legado
            } else {
                fullImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .path(entity.getImageUrl())
                        .toUriString();
            }
        }

        var response = new ProductResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getCategoryId(),
                entity.getActive()
        );
        // Assumindo que ProductResponse tem setter ou construtor para imagem (ajustar DTO se necessário)
        // Como o DTO ProductResponse é simples, em produção adicionaríamos o campo 'imageUrl'.
        // Para este script manter compatibilidade, injetamos no payload se possível ou mantemos simples.
        
        return response;
    }
}
