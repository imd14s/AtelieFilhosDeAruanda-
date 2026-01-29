package com.atelie.ecommerce.api.webhook;

import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.application.service.fiscal.InvoiceService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final InvoiceService invoiceService;
    
    @Value("${WEBHOOK_SECRET:my-secret-webhook-key}")
    private String webhookSecret;

    public WebhookController(OrderService orderService, OrderRepository orderRepository, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.invoiceService = invoiceService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<?> handleMercadoPago(
            @RequestBody Map<String, Object> payload,
            @RequestParam(value = "token", required = false) String token) {
        
        if (token == null || !token.equals(webhookSecret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Webhook Token");
        }

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
                validatePaymentAmount(orderId, payload);
                orderService.approveOrder(orderId);
                
                // --- NOVO: Emite nota fiscal automaticamente ---
                invoiceService.emitInvoiceForOrder(orderId);
                log.info("Processo de NFe iniciado para pedido {}", orderId);
            } 
            else if ("rejected".equalsIgnoreCase(statusStr) || "cancelled".equalsIgnoreCase(statusStr)) {
                orderService.cancelOrder(orderId, "Pagamento " + statusStr);
            }

        } catch (Exception e) {
            log.error("Erro processando webhook ref {}", orderIdStr, e);
            if (e instanceof SecurityException) return ResponseEntity.badRequest().body(e.getMessage());
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.ok().build();
    }

    private void validatePaymentAmount(UUID orderId, Map<String, Object> payload) {
        if (payload.containsKey("transaction_amount")) {
            BigDecimal paidAmount = new BigDecimal(payload.get("transaction_amount").toString());
            OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));
            
            if (paidAmount.compareTo(order.getTotalAmount()) < 0) {
                throw new SecurityException("Valor pago menor que o total");
            }
        }
    }
}
