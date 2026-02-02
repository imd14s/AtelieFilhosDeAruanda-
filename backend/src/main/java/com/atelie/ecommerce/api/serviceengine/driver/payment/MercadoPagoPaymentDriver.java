package com.atelie.ecommerce.api.serviceengine.driver.payment;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class MercadoPagoPaymentDriver implements ServiceDriver {

    private final RestTemplate restTemplate;
    private final Environment env;

    public MercadoPagoPaymentDriver(RestTemplate restTemplate, Environment env) {
        this.restTemplate = restTemplate;
        this.env = env;
    }

    @Override
    public String driverKey() { return "payment.mercadopago"; }

    @Override
    public ServiceType serviceType() { return ServiceType.PAYMENT; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String accessToken = DriverConfigReader.requireNonBlank(
            (String) config.get("access_token"), "access_token (Config MP)"
        );

        String notificationUrl = (String) config.get("notification_url");
        BigDecimal amount = (BigDecimal) request.get("amount");
        String email = (String) request.get("email");
        String externalRef = (String) request.get("orderId");

        Map<String, Object> mpRequest = new HashMap<>();
        mpRequest.put("transaction_amount", amount);
        mpRequest.put("description", "Pedido " + externalRef);
        mpRequest.put("payment_method_id", "pix");

        Map<String, Object> payer = new HashMap<>();
        payer.put("email", email);
        mpRequest.put("payer", payer);

        if (notificationUrl != null && !notificationUrl.isBlank()) {
            mpRequest.put("notification_url", notificationUrl);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            headers.set("X-Idempotency-Key", UUID.randomUUID().toString());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mpRequest, headers);

            // CORREÇÃO: Fallback hardcoded removido. Exige MP_API_URL no .env ou Config Table.
            String apiUrl = env.getProperty("MP_API_URL");
            if (apiUrl == null || apiUrl.isBlank()) {
                throw new IllegalStateException("Configuração MP_API_URL ausente no ambiente!");
            }

            Map response = restTemplate.postForObject(apiUrl.trim(), entity, Map.class);

            Map<String, Object> result = new HashMap<>();
            result.put("provider", "MERCADO_PAGO");
            result.put("status", "pending");
            if (response != null) {
                result.put("external_id", response.get("id"));
                Map poi = (Map) response.get("point_of_interaction");
                if (poi != null) {
                    Map transData = (Map) poi.get("transaction_data");
                    if (transData != null) {
                        result.put("qr_code", transData.get("qr_code"));
                        result.put("qr_code_base64", transData.get("qr_code_base64"));
                    }
                }
            }
            return result;
        } catch (Exception e) {
            return Map.of("error", true, "message", "Erro MP: " + e.getMessage());
        }
    }
}
