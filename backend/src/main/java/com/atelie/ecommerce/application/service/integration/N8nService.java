package com.atelie.ecommerce.application.service.integration;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class N8nService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(N8nService.class);

    private final RestTemplate restTemplate;
    private final DynamicConfigService configService;

    private static final String N8N_URL_KEY = "N8N_WEBHOOK_URL";
    private static final String N8N_ENABLED_KEY = "N8N_Automation_Enabled";

    public N8nService(RestTemplate restTemplate, DynamicConfigService configService) {
        this.restTemplate = restTemplate;
        this.configService = configService;
    }

    public boolean isAutomationEnabled() {
        if (!configService.containsKey(N8N_ENABLED_KEY))
            return false;
        return configService.requireBoolean(N8N_ENABLED_KEY);
    }

    public void sendLowStockAlert(String productName, Integer currentStock, int threshold) {
        if (!isAutomationEnabled())
            return;

        try {
            String url = configService.requireString(N8N_URL_KEY);
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "LOW_STOCK_ALERT");
            payload.put("product", productName);
            payload.put("stock", currentStock);
            payload.put("threshold", threshold);
            payload.put("message", "Produto " + productName + " crítico!");

            restTemplate.postForEntity(url, payload, String.class);
            log.info("N8N Alert Sent: Product={} Stock={}", productName, currentStock);
        } catch (Exception e) {
            log.error("Failed to send N8N alert", e);
        }
    }
}
