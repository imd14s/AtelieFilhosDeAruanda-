package com.atelie.ecommerce.api.integration;

import com.atelie.ecommerce.application.integration.MarketplaceCoreService;
import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationsController {

    private final MarketplaceCoreService coreService;
    private final com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository productRepository;

    public IntegrationsController(MarketplaceCoreService coreService,
            com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository productRepository) {
        this.coreService = coreService;
        this.productRepository = productRepository;
    }

    @PostMapping("/{provider}/credentials")
    public ResponseEntity<MarketplaceIntegrationEntity> saveCredentials(
            @PathVariable String provider,
            @RequestBody Map<String, String> credentials) {
        return ResponseEntity.ok(coreService.saveCredentials(provider, credentials));
    }

    @GetMapping("/{provider}/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl(
            @PathVariable String provider,
            @RequestParam String redirectUri) {
        String url = coreService.getAuthorizationUrl(provider, redirectUri);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/{provider}/callback")
    public ResponseEntity<String> handleCallback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam String redirectUri) {
        coreService.handleCallback(provider, code, redirectUri);
        return ResponseEntity.ok("Autenticação finalizada com sucesso! Você pode fechar esta janela.");
    }

    @GetMapping("/{provider}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String provider) {
        return coreService.getIntegration(provider)
                .map(i -> {
                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("provider", i.getProvider());
                    response.put("active", i.isActive());
                    response.put("configured", i.getEncryptedCredentials() != null);
                    response.put("updatedAt", i.getUpdatedAt());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.ok(java.util.Map.of(
                        "provider", provider,
                        "active", false,
                        "configured", false)));
    }

    @PostMapping("/{provider}/export-product/{productId}")
    public ResponseEntity<Map<String, String>> exportProduct(
            @PathVariable String provider,
            @PathVariable java.util.UUID productId) {

        com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity product = productRepository
                .findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        coreService.exportProduct(provider, product);
        return ResponseEntity.ok(Map.of("message", "Product exported successfully to " + provider));
    }

    @PostMapping("/{provider}/test-connection")
    public ResponseEntity<Map<String, String>> testConnection(@PathVariable String provider,
            @RequestBody Map<String, String> credentials) {
        coreService.testConnection(provider, credentials);
        return ResponseEntity.ok(Map.of("message", "Conexão testada com sucesso para " + provider));
    }

    @PostMapping("/{provider}/sync")
    public ResponseEntity<Map<String, Object>> syncProducts(@PathVariable String provider) {
        int count = coreService.syncProducts(provider);
        return ResponseEntity.ok(Map.of(
                "message", "Sincronização concluída com sucesso",
                "count", count));
    }
}
