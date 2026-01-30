package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.LinkIntegrationRequest;
import com.atelie.ecommerce.application.service.catalog.product.ProductIntegrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductIntegrationController {

    private final ProductIntegrationService integrationService;

    public ProductIntegrationController(ProductIntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @PostMapping("/{productId}/integrations")
    public ResponseEntity<Void> linkProduct(
            @PathVariable UUID productId,
            @RequestBody @Valid LinkIntegrationRequest request) {
        
        integrationService.linkProduct(productId, request);
        return ResponseEntity.ok().build();
    }
}
