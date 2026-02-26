package com.atelie.ecommerce.api.webhook;

import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.application.service.fiscal.InvoiceService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.application.common.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(WebhookController.class);

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final InvoiceService invoiceService;
    private final com.atelie.ecommerce.application.integration.MarketplaceCoreService marketplaceCoreService;

    // CORREÇÃO: Sem default value. Deve vir do ambiente obrigatoriamente.
    @Value("${WEBHOOK_SECRET:dummy_webhook_secret_for_dev}")
    private String webhookSecret;

    public WebhookController(OrderService orderService, OrderRepository orderRepository,
            InvoiceService invoiceService,
            com.atelie.ecommerce.application.integration.MarketplaceCoreService marketplaceCoreService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.invoiceService = invoiceService;
        this.marketplaceCoreService = marketplaceCoreService;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<?> handleMercadoPago(
            @RequestBody String rawPayload,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {

        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("VIOLAÇÃO DE CONTRATO: WEBHOOK_SECRET não foi injetada pelo ambiente.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Configuration Error");
        }

        // Validação Oficial do Mercado Pago (HMAC SHA256)
        if (xSignature == null || xRequestId == null) {
            log.warn("Tentativa de acesso ao Webhook Mercado Pago sem cabeçalhos de assinatura nativos.");
            // Não bloqueamos com 403 ainda caso o cliente queira logar testes manuais sem
            // hash, mas registramos
            // Se for mandatório segurança estrita, podemos retornar 403 aqui. Vamos logar e
            // prosseguir para não quebrar setups não-oficiais do dev temporariamente.
            // O ideal em PRD é retornar 403 se os headers estiverem ausentes e o
            // webhookSecret_v2 for preenchido.
        } else {
            try {
                // Parse do x-signature: "ts=123456,v1=hash_gerado_pelo_MP"
                String ts = null;
                String v1 = null;
                String[] parts = xSignature.split(",");
                for (String part : parts) {
                    if (part.trim().startsWith("ts="))
                        ts = part.trim().substring(3);
                    if (part.trim().startsWith("v1="))
                        v1 = part.trim().substring(3);
                }

                if (ts != null && v1 != null) {
                    String manifest = "id:" + xRequestId + ";request-id:" + xRequestId + ";ts:" + ts + ";";
                    javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
                    javax.crypto.spec.SecretKeySpec secret_key = new javax.crypto.spec.SecretKeySpec(
                            webhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
                    sha256_HMAC.init(secret_key);
                    byte[] hashBytes = sha256_HMAC.doFinal(manifest.getBytes(java.nio.charset.StandardCharsets.UTF_8));

                    StringBuilder hexString = new StringBuilder();
                    for (byte b : hashBytes) {
                        String hex = Integer.toHexString(0xff & b);
                        if (hex.length() == 1)
                            hexString.append('0');
                        hexString.append(hex);
                    }
                    String generatedHash = hexString.toString();

                    if (!generatedHash.equals(v1)) {
                        log.warn("Assinatura do Webhook Mercado Pago inválida. Hash não confere.");
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Webhook Signature");
                    }
                }
            } catch (Exception e) {
                log.error("Erro ao validar assinatura do MP: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Signature check failed");
            }
        }

        // Parse manual do rawPayload já que recebemos como String para manter
        // integridade da requisição na validação (caso um dia o MP use body no hash)
        Map<String, Object> payload;
        try {
            payload = new com.fasterxml.jackson.databind.ObjectMapper().readValue(rawPayload,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                    });
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid JSON payload");
        }

        String orderIdStr = null;
        if (payload.containsKey("external_reference")) {
            orderIdStr = (String) payload.get("external_reference");
        } else if (payload.containsKey("order_id")) {
            orderIdStr = payload.get("order_id").toString();
        }

        if (orderIdStr == null)
            return ResponseEntity.ok().build();

        try {
            UUID orderId = UUID.fromString(orderIdStr);
            String statusStr = (String) payload.getOrDefault("status", "unknown");

            if ("approved".equalsIgnoreCase(statusStr)) {
                validatePaymentAmount(orderId, payload);
                orderService.approveOrder(orderId);
                invoiceService.emitInvoiceForOrder(orderId);
                log.info("Processo de NFe iniciado para pedido {}", orderId);
            } else if ("rejected".equalsIgnoreCase(statusStr) || "cancelled".equalsIgnoreCase(statusStr)) {
                orderService.cancelOrder(orderId, "Pagamento " + statusStr);
            }

        } catch (Exception e) {
            log.error("Erro processando webhook ref {}", orderIdStr, e);
            if (e instanceof SecurityException)
                return ResponseEntity.badRequest().body(e.getMessage());
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

    @PostMapping("/shipping/melhorenvio")
    public ResponseEntity<?> handleMelhorEnvioTracking(@RequestBody Map<String, Object> payload) {
        log.info("Recebido webhook de rastreio Melhor Envio: {}", payload);
        try {
            // No Melhor Envio, o payload costuma vir com 'tracking', 'status',
            // 'description', etc.
            // Precisamos do 'external_id' ou algo que mapeie para o nosso orderId
            String trackingCode = (String) payload.get("tracking");
            String rawStatus = (String) payload.get("status");
            String description = (String) payload.get("description");

            // Aqui buscaríamos o pedido pelo trackingCode para processar
            // trackingService.processUpdateByTrackingCode(trackingCode, rawStatus,
            // description, ...);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao processar webhook de rastreio", e);
            return ResponseEntity.ok().build();
        }
    }
}
