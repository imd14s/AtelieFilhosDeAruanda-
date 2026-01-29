package com.atelie.ecommerce.api.admin;

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

    public AdminProviderController(ServiceProviderJpaRepository repository) {
        this.repository = repository;
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
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceProviderEntity> update(@PathVariable UUID id, @RequestBody ServiceProviderEntity dto) {
        return repository.findById(id)
            .map(existing -> {
                // Atualiza apenas campos editáveis, preservando ID e CreatedAt
                existing.setName(dto.getName());
                existing.setServiceType(dto.getServiceType());
                existing.setCode(dto.getCode());
                existing.setPriority(dto.getPriority());
                existing.setDriverKey(dto.getDriverKey());
                existing.setHealthEnabled(dto.isHealthEnabled());
                existing.setEnabled(dto.isEnabled());
                
                existing.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(repository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ServiceProviderEntity> toggle(@PathVariable UUID id, @RequestBody Boolean enabled) {
        return repository.findById(id)
                .map(provider -> {
                    provider.setEnabled(enabled);
                    provider.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(repository.save(provider));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
