package com.atelie.ecommerce.api.settings;

import com.atelie.ecommerce.domain.payment.model.PaymentProvider;
import com.atelie.ecommerce.infrastructure.persistence.payment.PaymentProviderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings/payment")
public class PaymentSettingsController {

    private final PaymentProviderRepository repository;

    public PaymentSettingsController(PaymentProviderRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PaymentProvider>> getAll() {
        // TODO: In a real scenario, we should mask sensitive config values here
        return ResponseEntity.ok(repository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentProvider> update(@PathVariable UUID id, @RequestBody PaymentProvider payload) {
        return repository.findById(id).map(provider -> {
            if (payload.getName() != null)
                provider.setName(payload.getName());
            if (payload.getConfig() != null)
                provider.setConfig(payload.getConfig());
            if (payload.getInstallments() != null)
                provider.setInstallments(payload.getInstallments());
            return ResponseEntity.ok(repository.save(provider));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<PaymentProvider> toggle(@PathVariable UUID id, @RequestBody Map<String, Boolean> payload) {
        return repository.findById(id).map(provider -> {
            if (payload.containsKey("enabled")) {
                provider.setEnabled(payload.get("enabled"));
            }
            return ResponseEntity.ok(repository.save(provider));
        }).orElse(ResponseEntity.notFound().build());
    }
}
