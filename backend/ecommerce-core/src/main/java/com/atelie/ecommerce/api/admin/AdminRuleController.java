package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rules")
public class AdminRuleController {

    private final ServiceRoutingRuleJpaRepository repository;

    public AdminRuleController(ServiceRoutingRuleJpaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ServiceRoutingRuleEntity> list(@RequestParam(required = false) String type) {
        if (type != null) {
            return repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type, true);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ServiceRoutingRuleEntity> create(@RequestBody ServiceRoutingRuleEntity entity) {
        if (entity.getId() == null) entity.setId(UUID.randomUUID());
        entity.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRoutingRuleEntity> update(@PathVariable UUID id, @RequestBody ServiceRoutingRuleEntity entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
