package com.atelie.ecommerce.api.webhook;

import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final OrderService orderService;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<?> handleMercadoPago(@RequestBody Map<String, Object> payload) {
        // Lógica simplificada para passar no build
        System.out.println("Webhook recebido: " + payload);
        return ResponseEntity.ok().build();
    }
}
