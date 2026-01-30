package com.atelie.ecommerce.api.serviceengine.driver;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

// Classe base abstrata (não é mais @Component direto)
public abstract class GenericWebhookDriver implements ServiceDriver {

    private final RestTemplate restTemplate;

    protected GenericWebhookDriver(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String url = (String) config.get("url");
        String authToken = (String) config.get("auth_token");
        
        if (url == null) throw new IllegalArgumentException("URL obrigatória na config do Webhook");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (authToken != null) headers.set("Authorization", "Bearer " + authToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("provider", "WEBHOOK_" + serviceType().name());
            result.put("raw_response", response);
            
            // Mapeamento inteligente de resposta
            if (response != null) {
                if (response.containsKey("price")) result.put("cost", response.get("price"));
                if (response.containsKey("cost")) result.put("cost", response.get("cost"));
                if (response.containsKey("status")) result.put("status", response.get("status"));
            }
            return result;
        } catch (Exception e) {
            return Map.of("error", true, "message", e.getMessage());
        }
    }
}
