package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.domain.shipping.event.TrackingUpdatedEvent;
import com.atelie.ecommerce.domain.shipping.model.TrackingStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.shipping.TrackingHistoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.TrackingHistoryRepository;
import com.atelie.ecommerce.infrastructure.shipping.melhorenvio.MelhorEnvioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class TrackingService {

    private final TrackingHistoryRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final MelhorEnvioClient client;
    private final ApplicationEventPublisher eventPublisher;

    public TrackingService(TrackingHistoryRepository trackingRepository,
            OrderRepository orderRepository,
            MelhorEnvioClient client,
            ApplicationEventPublisher eventPublisher) {
        this.trackingRepository = trackingRepository;
        this.orderRepository = orderRepository;
        this.client = client;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void processUpdate(UUID orderId, String trackingCode, String rawStatus, String description, String location,
            Instant occurredAt) {
        OrderEntity order = orderRepository.findById(orderId).orElse(null);
        if (order == null)
            return;

        TrackingStatus oldStatus = parseStatusFromOrder(order);
        TrackingStatus newStatus = normalizeStatus(rawStatus);

        // Só processamos se houver mudança real ou se for o primeiro registro
        boolean isNew = trackingRepository.findByTrackingCodeOrderByOccurredAtDesc(trackingCode).isEmpty();

        if (isNew || oldStatus != newStatus) {
            log.info("[TRACKING] Atualização detectada para pedido {}: {} -> {}", orderId, oldStatus, newStatus);

            TrackingHistoryEntity history = new TrackingHistoryEntity();
            history.setOrder(order);
            history.setTrackingCode(trackingCode);
            history.setStatus(newStatus);
            history.setRawStatus(rawStatus);
            history.setDescription(description);
            history.setLocation(location);
            history.setOccurredAt(occurredAt != null ? occurredAt : Instant.now());

            trackingRepository.save(history);

            // Atualiza status no pedido se for mudança relevante
            updateOrderTrackingStatus(order, newStatus);

            // Dispara evento para notificações
            eventPublisher.publishEvent(new TrackingUpdatedEvent(
                    orderId, trackingCode, oldStatus, newStatus, location, description, Instant.now()));
        }
    }

    private TrackingStatus normalizeStatus(String raw) {
        if (raw == null)
            return TrackingStatus.PENDING;
        String s = raw.toLowerCase();

        if (s.contains("postado") || s.contains("postagem"))
            return TrackingStatus.POSTED;
        if (s.contains("trânsito") || s.contains("encaminhado") || s.contains("saída"))
            return TrackingStatus.EN_ROUTE;
        if (s.contains("entregue"))
            return TrackingStatus.DELIVERED;
        if (s.contains("extraviado") || s.contains("roubo") || s.contains("devolvido"))
            return TrackingStatus.FAILURE;
        if (s.contains("cancelado"))
            return TrackingStatus.CANCELED;

        return TrackingStatus.PENDING;
    }

    private TrackingStatus parseStatusFromOrder(OrderEntity order) {
        // Lógica para inferir status atual baseado no último registro de histórico
        return trackingRepository.findByOrderIdOrderByOccurredAtDesc(order.getId())
                .stream().findFirst()
                .map(TrackingHistoryEntity::getStatus)
                .orElse(TrackingStatus.PENDING);
    }

    private void updateOrderTrackingStatus(OrderEntity order, TrackingStatus status) {
        // Se entregue, podemos marcar o pedido como finalizado no domínio
        if (status == TrackingStatus.DELIVERED) {
            order.setStatus("DELIVERED");
        }
        orderRepository.save(order);
    }

    @Scheduled(fixedRate = 14400000) // 4 horas
    public void pollingJob() {
        log.info("[TRACKING] Iniciando job de polling para pedidos em trânsito...");
        // Busca pedidos que possuam trackingCode e não estejam entregues
        List<OrderEntity> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getTrackingCode() != null && !"DELIVERED".equals(o.getStatus()))
                .toList();

        for (OrderEntity order : activeOrders) {
            try {
                // Aqui precisaríamos do token do provedor (armazenado em config ou tenant)
                // Por simplicidade, assumimos que o MelhorEnvioClient já sabe lidar ou o token
                // é injetado
                // Map<String, Object> trackingData = client.getTracking("FIXME_TOKEN",
                // order.getTrackingCode());
                // log.info("Polling para {}: {}", order.getTrackingCode(), trackingData);
                // processUpdate(...)
            } catch (Exception e) {
                log.error("Erro no polling do pedido {}: {}", order.getId(), e.getMessage());
            }
        }
    }
}
