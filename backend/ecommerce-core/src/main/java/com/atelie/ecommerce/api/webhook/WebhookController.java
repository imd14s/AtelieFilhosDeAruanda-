package com.atelie.ecommerce.api.webhook;

import com.atelie.ecommerce.application.integration.mercadolivre.MercadoLivreService;
import com.atelie.ecommerce.application.service.order.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final MercadoLivreService mercadoLivreService;
    private final OrderService orderService;

    public WebhookController(MercadoLivreService mercadoLivreService, OrderService orderService) {
        this.mercadoLivreService = mercadoLivreService;
        this.orderService = orderService;
    }

    /**
     * Endpoint que o Mercado Livre chama.
     * Payload Exemplo ML: { "topic": "orders_v2", "resource": "/orders/123456", "user_id": 123 }
     */
    @PostMapping("/mercadolivre")
    public ResponseEntity<Void> handleMercadoLivreNotification(@RequestBody Map<String, Object> payload) {
        log.info("Webhook ML recebido: {}", payload);

        String topic = (String) payload.get("topic");
        String resource = (String) payload.get("resource");

        // Só processamos notificações de vendas (orders_v2)
        if ("orders_v2".equals(topic) && resource != null) {
            try {
                // 1. Traduz o aviso em um Pedido Interno
                var orderRequest = mercadoLivreService.fetchAndConvertOrder(resource);
                
                // 2. Cria o pedido (Baixa estoque, salva no banco)
                orderService.createOrder(orderRequest);
                
                log.info("Pedido criado com sucesso a partir do Webhook ML");
            } catch (Exception e) {
                log.error("Erro ao processar webhook ML", e);
                // Retornamos 200 OK para o ML não ficar tentando re-enviar infinitamente se for erro de negócio
                // (Em prod, usaríamos fila DLQ)
            }
        }

        return ResponseEntity.ok().build();
    }
}
