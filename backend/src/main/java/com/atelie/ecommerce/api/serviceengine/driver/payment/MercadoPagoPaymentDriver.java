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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class MercadoPagoPaymentDriver implements ServiceDriver {
    private static final Logger log = LoggerFactory.getLogger(MercadoPagoPaymentDriver.class);

    private final RestTemplate restTemplate;
    private final Environment env;

    public MercadoPagoPaymentDriver(RestTemplate restTemplate, Environment env) {
        this.restTemplate = restTemplate;
        this.env = env;
    }

    @Override
    public String driverKey() {
        return "payment.mercadopago";
    }

    @Override
    public ServiceType serviceType() {
        return ServiceType.PAYMENT;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String paymentMethodId = (String) request.getOrDefault("payment_method_id", "pix");
        String accessToken = null;

        if (config.get("credentials") instanceof Map) {
            Map<String, Object> credentials = (Map<String, Object>) config.get("credentials");
            accessToken = (String) credentials.get("accessToken");
            log.info("[DEBUG-MP] Token extraído das configurações do banco: {}",
                    accessToken != null ? accessToken.substring(0, Math.min(accessToken.length(), 10)) + "..."
                            : "nulo");
        }

        if (accessToken == null || accessToken.isBlank()) {
            accessToken = env.getProperty("MP_ACCESS_TOKEN");
            log.info("[DEBUG-MP] Fallback para variável de ambiente MP_ACCESS_TOKEN: {}",
                    accessToken != null ? accessToken.substring(0, Math.min(accessToken.length(), 10)) + "..."
                            : "nulo");
        }

        accessToken = DriverConfigReader.requireNonBlank(accessToken, "access_token (Config MP)");
        String notificationUrl = (String) config.get("notification_url");
        BigDecimal amount = (BigDecimal) request.get("amount");
        String email = (String) request.get("email");
        String externalRef = (String) request.get("orderId");
        String token = (String) request.get("token"); // Token do cartão se for credit_card

        Map<String, Object> mpRequest = new HashMap<>();
        mpRequest.put("transaction_amount", amount);
        mpRequest.put("description", "Pedido " + externalRef);
        mpRequest.put("payment_method_id", paymentMethodId);
        mpRequest.put("external_reference", externalRef);

        if ("credit_card".equals(paymentMethodId)) {
            if (token == null || token.isBlank()) {
                return Map.of("error", true, "message", "Token do cartão ausente para pagamento via crédito");
            }
            mpRequest.put("token", token);
            mpRequest.put("installments", request.getOrDefault("installments", 1));
        }

        Map<String, Object> payer = new HashMap<>();
        payer.put("email", email);

        // Dados adicionais do payer para cartão (opcional mas recomendado)
        if (request.containsKey("identification_number")) {
            Map<String, String> identification = new HashMap<>();
            identification.put("type", "CPF");
            identification.put("number", (String) request.get("identification_number"));
            payer.put("identification", identification);
        }

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

            String apiUrl = env.getProperty("MP_API_URL", "https://api.mercadopago.com/v1/payments");

            Map response = restTemplate.postForObject(apiUrl.trim(), entity, Map.class);

            Map<String, Object> result = new HashMap<>();
            result.put("provider", "MERCADO_PAGO");

            if (response != null) {
                String status = (String) response.get("status");
                result.put("status", status);
                result.put("external_id", response.get("id"));
                result.put("status_detail", response.get("status_detail"));

                if ("pix".equals(paymentMethodId)) {
                    Map poi = (Map) response.get("point_of_interaction");
                    if (poi != null) {
                        Map transData = (Map) poi.get("transaction_data");
                        if (transData != null) {
                            result.put("qr_code", transData.get("qr_code"));
                            result.put("qr_code_base64", transData.get("qr_code_base64"));
                        }
                    }
                }
            }
            return result;
        } catch (Exception e) {
            return Map.of("error", true, "message", "Erro MP: " + e.getMessage());
        }
    }
}
