package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.application.service.config.SystemConfigService;
import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/configs")
public class AdminConfigController {

    private final SystemConfigService service;
    private final ApplicationEventPublisher eventPublisher;

    public AdminConfigController(SystemConfigService service, ApplicationEventPublisher eventPublisher) {
        this.service = service;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public List<SystemConfig> listAll() {
        return service.listAll();
    }

    @PostMapping
    public ResponseEntity<?> upsert(@RequestBody SystemConfigEntity dto) {
        if (dto.getConfigKey() == null || dto.getConfigKey().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("configKey is required");
        }
        service.upsert(dto.getConfigKey(), dto.getConfigValue());
        eventPublisher.publishEvent(new EntityChangedEvent(this, "SYSTEM_CONFIG"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        service.delete(key);
        eventPublisher.publishEvent(new EntityChangedEvent(this, "SYSTEM_CONFIG"));
        return ResponseEntity.noContent().build();
    }
}
