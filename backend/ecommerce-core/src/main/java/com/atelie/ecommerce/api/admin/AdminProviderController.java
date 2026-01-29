package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/providers")
public class AdminProviderController {

    private final ServiceProviderJpaRepository repository;
    private final ServiceProviderGateway gateway; // Injeta o gateway para chamar o refresh

    public AdminProviderController(ServiceProviderJpaRepository repository, ServiceProviderGateway gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }

    @GetMapping
    public List<ServiceProviderEntity> list() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ServiceProviderEntity> create(@RequestBody ServiceProviderEntity entity) {
        if (entity.getId() == null) entity.setId(UUID.randomUUID());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        ServiceProviderEntity saved = repository.save(entity);
        gateway.refresh(); // Limpa cache
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceProviderEntity> update(@PathVariable UUID id, @RequestBody ServiceProviderEntity dto) {
        return repository.findById(id)
            .map(existing -> {
                existing.setName(dto.getName());
                existing.setServiceType(dto.getServiceType());
                existing.setCode(dto.getCode());
                existing.setPriority(dto.getPriority());
                existing.setDriverKey(dto.getDriverKey());
                existing.setHealthEnabled(dto.isHealthEnabled());
                existing.setEnabled(dto.isEnabled());
                existing.setUpdatedAt(LocalDateTime.now());
                
                ServiceProviderEntity saved = repository.save(existing);
                gateway.refresh(); // Limpa cache
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ServiceProviderEntity> toggle(@PathVariable UUID id, @RequestBody Boolean enabled) {
        return repository.findById(id)
                .map(provider -> {
                    provider.setEnabled(enabled);
                    provider.setUpdatedAt(LocalDateTime.now());
                    
                    ServiceProviderEntity saved = repository.save(provider);
                    gateway.refresh(); // Limpa cache
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
