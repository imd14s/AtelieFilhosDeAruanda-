package com.atelie.ecommerce.api.settings;

import com.atelie.ecommerce.domain.shipping.model.ShippingProvider;
import com.atelie.ecommerce.infrastructure.persistence.shipping.ShippingProviderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings/shipping")
public class ShippingSettingsController {

    private final ShippingProviderRepository repository;

    public ShippingSettingsController(ShippingProviderRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<ShippingProvider>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingProvider> update(@PathVariable UUID id, @RequestBody ShippingProvider payload) {
        return repository.findById(id).map(provider -> {
            if (payload.getName() != null)
                provider.setName(payload.getName());
            if (payload.getConfig() != null)
                provider.setConfig(payload.getConfig());
            if (payload.getRules() != null)
                provider.setRules(payload.getRules());
            if (payload.getHeaders() != null)
                provider.setHeaders(payload.getHeaders());
            return ResponseEntity.ok(repository.save(provider));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ShippingProvider> toggle(@PathVariable UUID id, @RequestBody Map<String, Boolean> payload) {
        return repository.findById(id).map(provider -> {
            if (payload.containsKey("enabled")) {
                provider.setEnabled(payload.get("enabled"));
            }
            return ResponseEntity.ok(repository.save(provider));
        }).orElse(ResponseEntity.notFound().build());
    }
}
