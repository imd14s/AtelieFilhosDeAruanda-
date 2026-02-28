package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomShippingRegionService {

    private final CustomShippingRegionRepository repository;

    public CustomShippingRegionService(CustomShippingRegionRepository repository) {
        this.repository = repository;
    }

    public void processCepChunk(UUID providerId, List<String> cepsChunk) {
        if (cepsChunk == null || cepsChunk.isEmpty())
            return;

        List<CustomShippingRegionEntity> entitiesToSave = cepsChunk.stream()
                .filter(cep -> cep != null && cep.matches("\\d{8}"))
                .map(cep -> CustomShippingRegionEntity.builder()
                        .id(UUID.randomUUID())
                        .providerId(providerId)
                        .cep(cep)
                        .build())
                .collect(Collectors.toList());

        repository.saveAll(entitiesToSave);
    }

    public void clearCeps(UUID providerId) {
        repository.deleteByProviderId(providerId);
    }

    @Transactional(readOnly = true)
    public long countCepsByProvider(UUID providerId) {
        return repository.countByProviderId(providerId);
    }
}
