package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailConfig;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing/email-settings")
public class EmailConfigController {

    private final EmailConfigRepository repository;

    public EmailConfigController(EmailConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<EmailConfig> getConfig() {
        List<EmailConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PostMapping
    public ResponseEntity<EmailConfig> saveConfig(@RequestBody EmailConfig config) {
        // Garantir que sempre editamos o mesmo registro se houver apenas um
        List<EmailConfig> existing = repository.findAll();
        if (!existing.isEmpty()) {
            config.setId(existing.get(0).getId());
        }
        return ResponseEntity.ok(repository.save(config));
    }
}
