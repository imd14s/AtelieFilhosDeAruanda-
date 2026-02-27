package com.atelie.ecommerce.application.listener.shipping;

import com.atelie.ecommerce.domain.shipping.event.TrackingUpdatedEvent;
import com.atelie.ecommerce.domain.shipping.model.TrackingStatus;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.application.service.review.ReviewService;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class TrackingNotificationListener {

    private final CommunicationService communicationService;
    private final OrderRepository orderRepository;
    private final ReviewService reviewService;

    public TrackingNotificationListener(CommunicationService communicationService,
            OrderRepository orderRepository,
            ReviewService reviewService) {
        this.communicationService = communicationService;
        this.orderRepository = orderRepository;
        this.reviewService = reviewService;
    }

    @Async
    @EventListener
    public void handleTrackingUpdate(TrackingUpdatedEvent event) {
        log.info("[NOTIFICATION] Processando notificação de rastreio para pedido {}. Novo Status: {}",
                event.orderId(), event.newStatus());

        OrderEntity order = orderRepository.findById(event.orderId()).orElse(null);
        if (order == null || order.getCustomerEmail() == null) {
            log.warn("[NOTIFICATION] Pedido {} ou e-mail do cliente não encontrado. Ignorando notificação.",
                    event.orderId());
            return;
        }

        // Notificamos apenas mudanças para estados de "movimentação" ou "entrega"
        if (event.newStatus() != TrackingStatus.PENDING) {
            Map<String, Object> context = Map.of(
                    "orderNumber", order.getId().toString().substring(0, 8),
                    "customerName", order.getCustomerName() != null ? order.getCustomerName() : "Cliente",
                    "trackingCode", event.trackingCode(),
                    "statusMessage", formatMessage(event));

            communicationService.sendAutomation(AutomationType.TRACKING_UPDATE, order.getCustomerEmail(), context);

            // Se foi entregue, geramos tokens e enviamos convite de avaliação
            if (event.newStatus() == TrackingStatus.DELIVERED) {
                reviewService.generateReviewTokensForOrder(order);

                // Opcional: Enviar automação específica de convite
                // Ou podemos incluir os links no context do TRACKING_UPDATE se o template
                // suportar.
                // Seguindo a boa prática de separação, dispararemos uma nova automação.
                communicationService.sendAutomation(AutomationType.REVIEW_INVITATION, order.getCustomerEmail(),
                        context);
            }
        }
    }

    private String formatMessage(TrackingUpdatedEvent event) {
        return switch (event.newStatus()) {
            case POSTED -> "Seu pedido foi postado! Acompanhe pelo código: " + event.trackingCode();
            case EN_ROUTE -> "Sua encomenda está em trânsito: " + event.description();
            case DELIVERED -> "Oba! Seu pedido foi entregue. Esperamos que goste!";
            case FAILURE -> "Houve um imprevisto na entrega: " + event.description();
            case CANCELED -> "O rastreio do seu pedido foi cancelado.";
            default -> "Seu pedido está sendo processado.";
        };
    }
}
