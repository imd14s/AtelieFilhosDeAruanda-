package com.atelie.ecommerce.infrastructure.shipping.melhorenvio;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class MelhorEnvioClient {

    private final RestClient restClient;

    public MelhorEnvioClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://melhorenvio.com.br")
                .build();
    }

    public List<Map<String, Object>> calculate(String token, Map<String, Object> payload) {
        return restClient.post()
                .uri("/api/v2/me/shipment/calculate")
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<List<Map<String, Object>>>() {
                });
    }

    public Map<String, Object> addToCart(String token, Map<String, Object> payload) {
        return restClient.post()
                .uri("/api/v2/me/cart")
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                });
    }

    public Map<String, Object> checkout(String token, Map<String, Object> payload) {
        return restClient.post()
                .uri("/api/v2/me/shipment/checkout")
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                });
    }

    public Map<String, Object> generatePrint(String token, Map<String, Object> payload) {
        return restClient.post()
                .uri("/api/v2/me/shipment/print")
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                });
    }

    public Map<String, Object> getTracking(String token, String trackingCode) {
        return restClient.get()
                .uri("/api/v2/me/shipment/tracking/" + trackingCode)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                });
    }
}
