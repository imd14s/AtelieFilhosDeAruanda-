package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.AbandonedCartConfig;
import com.atelie.ecommerce.infrastructure.persistence.marketing.AbandonedCartConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing/abandoned-carts")
public class AbandonedCartController {

    private final AbandonedCartConfigRepository repository;

    public AbandonedCartController(AbandonedCartConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<AbandonedCartConfig> getConfig() {
        List<AbandonedCartConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            return ResponseEntity.ok(AbandonedCartConfig.builder().enabled(false).build());
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PutMapping
    public ResponseEntity<AbandonedCartConfig> updateConfig(@RequestBody AbandonedCartConfig config) {
        repository.deleteAll(); // Ensure singleton simplistic approach
        return ResponseEntity.ok(repository.save(config));
    }
}
