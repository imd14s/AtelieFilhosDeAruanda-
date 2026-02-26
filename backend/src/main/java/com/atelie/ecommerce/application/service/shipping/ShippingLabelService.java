package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.shipping.ShippingLabelEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.ShippingLabelRepository;
import com.atelie.ecommerce.infrastructure.shipping.melhorenvio.MelhorEnvioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShippingLabelService {

    private final MelhorEnvioClient melhorEnvioClient;
    private final DynamicConfigService configService;
    private final OrderRepository orderRepository;
    private final ShippingLabelRepository labelRepository;

    @Transactional
    public void generateLabelForOrder(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado: " + orderId));

        if (!"Melhor Envio".equalsIgnoreCase(order.getShippingProvider())) {
            log.info("Provedor de frete {} não suporta automação de etiquetas.", order.getShippingProvider());
            return;
        }

        String token = configService.getString("MELHOR_ENVIO_TOKEN");
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Token do Melhor Envio não configurado.");
        }

        try {
            if (order.getShippingIdExternal() == null) {
                throw new IllegalStateException("ID externo de frete ausente para o pedido " + orderId);
            }

            // 1. Checkout (Compra a etiqueta)
            Map<String, Object> checkoutPayload = Map.of("orders", List.of(order.getShippingIdExternal()));
            Map<String, Object> checkoutResult = melhorEnvioClient.checkout(token, checkoutPayload);
            log.info("Compra de etiqueta realizada para o pedido {}", orderId);

            // 2. Buscar detalhes da etiqueta (para pegar Tracking e Custo)
            // No Melhor Envio, após o checkout, o envio muda de status.
            // Para simplificar, vamos assumir que o custo foi o cotado inicialmente.
            // Em uma integração real, buscaríamos o objeto do envio atualizado.

            // 3. Gerar Impressão / PDF
            Map<String, Object> printPayload = Map.of("orders", List.of(order.getShippingIdExternal()));
            Map<String, Object> printResult = melhorEnvioClient.generatePrint(token, printPayload);
            String labelUrl = (String) printResult.get("url");

            // 4. Buscar Tracking (Polling imediato ou assumir que virá via Webhook/Service
            // later)
            // Aqui vamos tentar buscar o tracking se disponível
            Map<String, Object> shipmentData = melhorEnvioClient.getTracking(token, order.getShippingIdExternal());
            String trackingCode = (String) shipmentData.get("tracking");

            // 5. Persistir ShippingLabelEntity
            int retentionDays = (int) configService.getLong("DOCUMENT_RETENTION_DAYS", 30);

            ShippingLabelEntity label = labelRepository.findByOrderId(orderId)
                    .orElse(new ShippingLabelEntity());

            label.setId(UUID.randomUUID());
            label.setOrder(order);
            label.setExternalId(order.getShippingIdExternal());
            label.setTrackingCode(trackingCode);
            label.setLabelUrl(labelUrl);
            label.setStatus("GENERATED");
            label.setCost(order.getShippingCost()); // Conciliação com o custo cobrado no checkout
            label.setCreatedAt(Instant.now());
            label.setExpiresAt(Instant.now().plus(retentionDays, ChronoUnit.DAYS));

            labelRepository.save(label);

            // 6. Atualizar Pedido
            order.setTrackingCode(trackingCode);
            order.setLabelUrlMe(labelUrl);
            order.setStatus(OrderStatus.READY_FOR_SHIPPING.name());
            orderRepository.save(order);

            log.info("Módulo de etiquetas: Pedido {} atualizado para READY_FOR_SHIPPING com tracking {}", orderId,
                    trackingCode);

        } catch (Exception e) {
            log.error("Falha ao gerar etiqueta para o pedido {}", orderId, e);
            throw new RuntimeException("Erro na geração de etiqueta: " + e.getMessage());
        }
    }

    @Transactional
    public void cancelLabel(UUID orderId, String reason) {
        ShippingLabelEntity label = labelRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Etiqueta não encontrada para o pedido: " + orderId));

        String token = configService.getString("MELHOR_ENVIO_TOKEN");

        try {
            Map<String, Object> cancelPayload = Map.of(
                    "order", Map.of(
                            "id", label.getExternalId(),
                            "reason", reason));

            melhorEnvioClient.cancelLabel(token, cancelPayload);

            label.setStatus("CANCELED");
            labelRepository.save(label);

            OrderEntity order = label.getOrder();
            order.setTrackingCode(null);
            order.setLabelUrlMe(null);
            order.setStatus(OrderStatus.PAID.name()); // Volta para Pago para permitir nova tentativa se necessário
            orderRepository.save(order);

            log.info("Etiqueta do pedido {} cancelada com sucesso.", orderId);

        } catch (Exception e) {
            log.error("Erro ao cancelar etiqueta do pedido {}", orderId, e);
            throw new RuntimeException("Falha no cancelamento da etiqueta: " + e.getMessage());
        }
    }
}
