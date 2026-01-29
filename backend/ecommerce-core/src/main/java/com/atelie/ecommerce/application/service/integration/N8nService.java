package com.atelie.ecommerce.application.service.integration;

import com.atelie.ecommerce.infrastructure.persistence.settings.AppSettingsEntity;
import com.atelie.ecommerce.infrastructure.persistence.settings.AppSettingsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class N8nService {

    private final RestTemplate restTemplate;
    private final AppSettingsRepository settingsRepository;

    @Value("${N8N_WEBHOOK_URL:http://localhost:5678/webhook/test}")
    private String n8nWebhookUrl;

    private static final String LOW_STOCK_KEY = "ENABLE_LOW_STOCK_N8N";

    public N8nService(RestTemplate restTemplate, AppSettingsRepository settingsRepository) {
        this.restTemplate = restTemplate;
        this.settingsRepository = settingsRepository;
    }

    public boolean isAutomationEnabled() {
        return settingsRepository.findById(LOW_STOCK_KEY)
                .map(setting -> Boolean.parseBoolean(setting.getSettingValue()))
                .orElse(false); // Default safe
    }

    public void setAutomationStatus(boolean enabled) {
        AppSettingsEntity setting = settingsRepository.findById(LOW_STOCK_KEY)
                .orElse(new AppSettingsEntity(LOW_STOCK_KEY, "false", LocalDateTime.now()));
        
        setting.setSettingValue(String.valueOf(enabled));
        setting.setUpdatedAt(LocalDateTime.now());
        
        settingsRepository.save(setting);
    }

    public void sendLowStockAlert(String productName, Integer currentStock, int threshold) {
        if (!isAutomationEnabled()) {
            System.out.println("LOG: Automação n8n desligada. Alerta não enviado para " + productName);
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "LOW_STOCK_ALERT");
            payload.put("product", productName);
            payload.put("stock", currentStock);
            payload.put("threshold", threshold);
            payload.put("message", "O produto " + productName + " atingiu o nível crítico de estoque!");

            restTemplate.postForEntity(n8nWebhookUrl, payload, String.class);
            System.out.println("SUCESSO: Alerta enviado ao n8n para " + productName);
        } catch (Exception e) {
            System.err.println("ERRO: Falha ao conectar com n8n: " + e.getMessage());
        }
    }
}
