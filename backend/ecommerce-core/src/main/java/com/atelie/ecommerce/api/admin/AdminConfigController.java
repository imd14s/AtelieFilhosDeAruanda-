package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/configs")
public class AdminConfigController {

    private final SystemConfigRepository repository;
    private final DynamicConfigService configService;

    public AdminConfigController(SystemConfigRepository repository, DynamicConfigService configService) {
        this.repository = repository;
        this.configService = configService;
    }

    @GetMapping
    public List<SystemConfigEntity> listAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<SystemConfigEntity> upsert(@RequestBody SystemConfigEntity dto) {
        SystemConfigEntity saved = repository.save(dto);
        // Atualiza o cache local imediatamente para refletir a mudança
        configService.refresh();
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        repository.deleteById(key);
        configService.refresh();
        return ResponseEntity.noContent().build();
    }
}
