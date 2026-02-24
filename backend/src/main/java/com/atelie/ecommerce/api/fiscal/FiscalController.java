package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FiscalIntegrationEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.FiscalIntegrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fiscal-integrations")
@RequiredArgsConstructor
public class FiscalController {

    private final FiscalIntegrationRepository repository;

    @GetMapping
    public List<FiscalIntegrationEntity> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public FiscalIntegrationEntity save(@RequestBody FiscalIntegrationEntity entity) {
        // Se já existe um provedor com o mesmo nome, atualiza
        return repository.findByProviderName(entity.getProviderName())
                .map(existing -> {
                    existing.setApiKey(entity.getApiKey());
                    existing.setActive(entity.isActive());
                    existing.setApiUrl(entity.getApiUrl());
                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    if (entity.getId() == null)
                        entity.setId(UUID.randomUUID());
                    return repository.save(entity);
                });
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
