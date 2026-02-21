package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.application.service.config.AiConfigService;
import com.atelie.ecommerce.infrastructure.persistence.config.AiConfigEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configs/ai")
public class AiConfigController {

    private final AiConfigService aiConfigService;

    public AiConfigController(AiConfigService aiConfigService) {
        this.aiConfigService = aiConfigService;
    }

    @GetMapping
    public ResponseEntity<List<AiConfigEntity>> getAll() {
        return ResponseEntity.ok(aiConfigService.getAllConfigs());
    }

    @GetMapping("/{nomeIa}")
    public ResponseEntity<AiConfigEntity> getByName(@PathVariable String nomeIa) {
        return aiConfigService.getConfigByName(nomeIa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AiConfigEntity> save(@RequestBody AiConfigEntity config) {
        return ResponseEntity.ok(aiConfigService.saveConfig(config));
    }
}
