package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.infrastructure.persistence.feature.FeatureFlagEntity;
import com.atelie.ecommerce.infrastructure.persistence.feature.FeatureFlagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/features")
public class AdminFeatureFlagController {

    private final FeatureFlagRepository repository;

    public AdminFeatureFlagController(FeatureFlagRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<FeatureFlagEntity> list() {
        return repository.findAll();
    }

    @PostMapping
    public FeatureFlagEntity createOrUpdate(@RequestBody FeatureFlagEntity dto) {
        return repository.findByFlagKey(dto.getFlagKey())
                .map(existing -> {
                    existing.setEnabled(dto.isEnabled());
                    existing.setValueJson(dto.getValueJson());
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(dto));
    }
}
