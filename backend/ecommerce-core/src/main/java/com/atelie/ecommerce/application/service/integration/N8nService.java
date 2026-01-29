package com.atelie.ecommerce.application.service.integration;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class N8nService {

    private final RestTemplate restTemplate;
    private final DynamicConfigService configService;

    // Keys unificadas no system_config
    private static final String N8N_URL_KEY = "N8N_WEBHOOK_URL";
    private static final String N8N_ENABLED_KEY = "N8N_Automation_Enabled";

    public N8nService(RestTemplate restTemplate, DynamicConfigService configService) {
        this.restTemplate = restTemplate;
        this.configService = configService;
    }

    public boolean isAutomationEnabled() {
        if (!configService.containsKey(N8N_ENABLED_KEY)) return false;
        return configService.requireBoolean(N8N_ENABLED_KEY);
    }

    // Nota: O setter foi removido pois a alteração deve ser feita via 
    // endpoint de administração que edita o system_config genérico, não hardcoded aqui.

    public void sendLowStockAlert(String productName, Integer currentStock, int threshold) {
        if (!isAutomationEnabled()) {
            return;
        }

        try {
            // Pega URL do banco, sem hardcode, permitindo mudança em tempo real
            String url = configService.requireString(N8N_URL_KEY);

            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "LOW_STOCK_ALERT");
            payload.put("product", productName);
            payload.put("stock", currentStock);
            payload.put("threshold", threshold);
            payload.put("message", "O produto " + productName + " atingiu o nível crítico de estoque!");

            restTemplate.postForEntity(url, payload, String.class);
            System.out.println("SUCESSO: Alerta enviado ao n8n para " + productName);
        } catch (Exception e) {
            System.err.println("ERRO: Falha ao conectar com n8n ou configuração ausente: " + e.getMessage());
        }
    }
}
