package com.atelie.ecommerce.application.service.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class N8nService {

    private final RestTemplate restTemplate;
    private final JdbcTemplate jdbcTemplate;

    @Value("${N8N_WEBHOOK_URL:http://localhost:5678/webhook/test}")
    private String n8nWebhookUrl;

    public N8nService(RestTemplate restTemplate, JdbcTemplate jdbcTemplate) {
        this.restTemplate = restTemplate;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Método para ler a configuração do banco
    public boolean isAutomationEnabled() {
        String sql = "SELECT setting_value FROM app_settings WHERE setting_key = 'ENABLE_LOW_STOCK_N8N'";
        try {
            String value = jdbcTemplate.queryForObject(sql, String.class);
            return Boolean.parseBoolean(value);
        } catch (Exception e) {
            return false; // Padrão seguro: desligado se der erro
        }
    }

    // Método para ativar/desativar (será usado pelo Dashboard)
    public void setAutomationStatus(boolean enabled) {
        String sql = "UPDATE app_settings SET setting_value = ? WHERE setting_key = 'ENABLE_LOW_STOCK_N8N'";
        jdbcTemplate.update(sql, String.valueOf(enabled));
    }

    // Dispara o alerta
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