package com.atelie.ecommerce.application.service.config;

import com.atelie.ecommerce.infrastructure.persistence.config.AiConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.config.AiConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AiConfigService {

    private final AiConfigRepository aiConfigRepository;

    public AiConfigService(AiConfigRepository aiConfigRepository) {
        this.aiConfigRepository = aiConfigRepository;
    }

    @Transactional(readOnly = true)
    public List<AiConfigEntity> getAllConfigs() {
        return aiConfigRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<AiConfigEntity> getConfigByName(String nomeIa) {
        return aiConfigRepository.findByNomeIaIgnoreCase(nomeIa);
    }

    @Transactional(readOnly = true)
    public AiConfigEntity getGeminiConfig() {
        return aiConfigRepository.findByNomeIaIgnoreCase("Gemini")
                .orElseThrow(() -> new RuntimeException(
                        "Configuração do Gemini não encontrada. Configure no painel primeiro."));
    }

    @Transactional
    public AiConfigEntity saveConfig(AiConfigEntity config) {
        if (config.getId() == null) {
            config.setId(UUID.randomUUID());
            config.setCreatedAt(LocalDateTime.now());
        }

        Optional<AiConfigEntity> existing = aiConfigRepository.findByNomeIaIgnoreCase(config.getNomeIa());
        if (existing.isPresent() && !existing.get().getId().equals(config.getId())) {
            AiConfigEntity toUpdate = existing.get();
            toUpdate.setApiKey(config.getApiKey());
            toUpdate.setPrePrompt(config.getPrePrompt());
            toUpdate.setUpdatedAt(LocalDateTime.now());
            return aiConfigRepository.save(toUpdate);
        }

        config.setUpdatedAt(LocalDateTime.now());
        return aiConfigRepository.save(config);
    }
}
