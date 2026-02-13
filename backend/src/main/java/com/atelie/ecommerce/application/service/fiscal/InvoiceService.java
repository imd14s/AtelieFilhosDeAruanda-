package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.UUID;

@Service
public class InvoiceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InvoiceService.class);

    private final DynamicConfigService configService;
    private final RestTemplate restTemplate;

    public InvoiceService(DynamicConfigService configService, RestTemplate restTemplate) {
        this.configService = configService;
        this.restTemplate = restTemplate;
    }

    public void emitInvoiceForOrder(UUID orderId) {
        String webhookUrl = configService.getString("FISCAL_WEBHOOK_URL");

        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.info("Emissão de NFe ignorada: URL de webhook fiscal não configurada no Dashboard.");
            return;
        }

        try {
            // Dispara um POST simples para o integrador fiscal (Bling, Tiny, eNotas)
            // O payload é genérico, o integrador lá na ponta que se vire para buscar os
            // dados do pedido
            Map<String, Object> payload = Map.of(
                    "event", "ORDER_APPROVED",
                    "order_id", orderId.toString());

            restTemplate.postForLocation(webhookUrl, payload);
            log.info("Solicitação de NFe enviada para: {}", webhookUrl);

        } catch (Exception e) {
            log.error("Falha ao chamar webhook fiscal", e);
        }
    }
}
