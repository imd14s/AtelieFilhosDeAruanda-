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
    
    @Value("${WEBHOOK_SECRET:my-secret-webhook-key}")
    private String webhookSecret;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<?> handleMercadoPago(
            @RequestBody Map<String, Object> payload,
            @RequestParam(value = "token", required = false) String token) {
        
        if (token == null || !token.equals(webhookSecret)) {
            log.warn("Tentativa de webhook não autorizado. IP suspeito.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Webhook Token");
        }

        // CORREÇÃO: Logar apenas metadados seguros, nunca o payload completo
        Object extRef = payload.get("external_reference");
        Object status = payload.get("status");
        log.info("Webhook MP recebido. Ref: {}, Status: {}", extRef, status);

        String orderIdStr = null;
        if (payload.containsKey("external_reference")) {
            orderIdStr = (String) payload.get("external_reference");
        } else if (payload.containsKey("order_id")) {
             orderIdStr = payload.get("order_id").toString();
        }

        if (orderIdStr == null) return ResponseEntity.ok().build();

        try {
            UUID orderId = UUID.fromString(orderIdStr);
            String statusStr = (String) payload.getOrDefault("status", "unknown");

            if ("approved".equalsIgnoreCase(statusStr)) {
                orderService.approveOrder(orderId);
            } 
            else if ("rejected".equalsIgnoreCase(statusStr) || "cancelled".equalsIgnoreCase(statusStr)) {
                orderService.cancelOrder(orderId, "Pagamento " + statusStr);
            }

        } catch (Exception e) {
            log.error("Erro processando webhook ref {}", orderIdStr, e);
            // Retorna 200 para o MP parar de tentar (pois é erro interno nosso ou dados inválidos)
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.ok().build();
    }
}
