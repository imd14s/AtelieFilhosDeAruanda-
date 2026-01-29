package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderConfigEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/provider-configs")
public class AdminProviderConfigController {

    private final ServiceProviderConfigJpaRepository repository;
    private final ServiceProviderConfigGateway gateway; // Injeta o gateway para limpar cache

    public AdminProviderConfigController(ServiceProviderConfigJpaRepository repository,
                                         ServiceProviderConfigGateway gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }

    @GetMapping("/{providerId}/{env}")
    public ResponseEntity<ServiceProviderConfigEntity> get(@PathVariable UUID providerId, @PathVariable String env) {
        return repository.findTopByProviderIdAndEnvironmentOrderByVersionDesc(providerId, env)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceProviderConfigEntity> upsert(@RequestBody ServiceProviderConfigEntity config) {
        if (config.getId() == null) config.setId(UUID.randomUUID());
        
        Optional<ServiceProviderConfigEntity> current = repository
            .findTopByProviderIdAndEnvironmentOrderByVersionDesc(config.getProviderId(), config.getEnvironment());
            
        config.setVersion(current.map(c -> c.getVersion() + 1).orElse(1));
        config.setUpdatedAt(LocalDateTime.now());
        
        ServiceProviderConfigEntity saved = repository.save(config);
        
        // --- LIMPEZA DE CACHE IMEDIATA ---
        gateway.refresh();
        
        return ResponseEntity.ok(saved);
    }
}
