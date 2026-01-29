package com.atelie.ecommerce.api.webhook;

import com.atelie.ecommerce.application.service.order.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final OrderService orderService;
    
    // Token fixo para simplificar. Em produção, use DynamicConfigService.
    @Value("${WEBHOOK_SECRET:my-secret-webhook-key}")
    private String webhookSecret;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<?> handleMercadoPago(
            @RequestBody Map<String, Object> payload,
            @RequestParam(value = "token", required = false) String token) {
        
        // --- SEGURANÇA: Validação de Token ---
        if (token == null || !token.equals(webhookSecret)) {
            log.warn("Tentativa de webhook não autorizado. IP suspeito.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Webhook Token");
        }

        log.info("Webhook Recebido e Validado: {}", payload);

        String orderIdStr = null;
        if (payload.containsKey("external_reference")) {
            orderIdStr = (String) payload.get("external_reference");
        } else if (payload.containsKey("order_id")) {
             orderIdStr = payload.get("order_id").toString();
        }

        String status = (String) payload.getOrDefault("status", "unknown");

        if (orderIdStr != null && "approved".equalsIgnoreCase(status)) {
            try {
                UUID orderId = UUID.fromString(orderIdStr);
                orderService.approveOrder(orderId);
                log.info("Pedido {} atualizado para PAID via Webhook.", orderId);
            } catch (Exception e) {
                log.error("Erro ao processar webhook para pedido " + orderIdStr, e);
                return ResponseEntity.badRequest().build();
            }
        }

        return ResponseEntity.ok().build();
    }
}
