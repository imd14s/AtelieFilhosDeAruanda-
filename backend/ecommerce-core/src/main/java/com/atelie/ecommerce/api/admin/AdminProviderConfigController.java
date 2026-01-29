package com.atelie.ecommerce.api.admin;

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

    public AdminProviderConfigController(ServiceProviderConfigJpaRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{providerId}/{env}")
    public ResponseEntity<ServiceProviderConfigEntity> get(@PathVariable UUID providerId, @PathVariable String env) {
        return repository.findTopByProviderIdAndEnvironmentOrderByVersionDesc(providerId, env)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServiceProviderConfigEntity> upsert(@RequestBody ServiceProviderConfigEntity config) {
        // Incrementa versão simples ou cria nova
        if (config.getId() == null) config.setId(UUID.randomUUID());
        
        Optional<ServiceProviderConfigEntity> current = repository
            .findTopByProviderIdAndEnvironmentOrderByVersionDesc(config.getProviderId(), config.getEnvironment());
            
        config.setVersion(current.map(c -> c.getVersion() + 1).orElse(1));
        config.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(repository.save(config));
    }
}
