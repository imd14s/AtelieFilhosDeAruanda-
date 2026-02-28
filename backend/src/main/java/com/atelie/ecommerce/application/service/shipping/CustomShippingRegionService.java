package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

    public void processCsvUpload(UUID providerId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo CSV não pode estar vazio.");
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String> lines = reader.lines().collect(Collectors.toList());
            if (lines.isEmpty())
                return;

            int startIndex = 0;
            if (lines.get(0).toLowerCase().contains("cep")) {
                startIndex = 1;
            }

            List<CustomShippingRegionEntity> entitiesToSave = new ArrayList<>();
            for (int i = startIndex; i < lines.size(); i++) {
                String line = lines.get(i).trim();
                if (line.isEmpty())
                    continue;

                String cepRaw = line.split(",")[0].split(";")[0];
                String cleanCep = cepRaw.replaceAll("\\D", "");

                if (cleanCep.length() == 8) {
                    entitiesToSave.add(CustomShippingRegionEntity.builder()
                            .id(UUID.randomUUID())
                            .providerId(providerId)
                            .cep(cleanCep)
                            .build());
                }
            }

            repository.deleteByProviderId(providerId);
            repository.saveAll(entitiesToSave);

        } catch (Exception e) {
            throw new RuntimeException("Falha ao processar arquivo CSV de CEPs.", e);
        }
    }

    @Transactional(readOnly = true)
    public long countCepsByProvider(UUID providerId) {
        return repository.countByProviderId(providerId);
    }
}
