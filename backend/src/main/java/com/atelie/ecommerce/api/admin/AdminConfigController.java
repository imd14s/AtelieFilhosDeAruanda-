package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/configs")
public class AdminConfigController {

    private final SystemConfigRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminConfigController(SystemConfigRepository repository, ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public List<SystemConfigEntity> listAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<SystemConfigEntity> upsert(@RequestBody SystemConfigEntity dto) {
        SystemConfigEntity saved = repository.save(dto);
        eventPublisher.publishEvent(new EntityChangedEvent(this, "SYSTEM_CONFIG"));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        repository.deleteById(key);
        eventPublisher.publishEvent(new EntityChangedEvent(this, "SYSTEM_CONFIG"));
        return ResponseEntity.noContent().build();
    }
}
