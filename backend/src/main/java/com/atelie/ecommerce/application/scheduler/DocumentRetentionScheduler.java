package com.atelie.ecommerce.application.scheduler;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.service.media.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@Slf4j
public class DocumentRetentionScheduler {

    private final OrderRepository orderRepository;
    private final CloudinaryService cloudinaryService;

    public DocumentRetentionScheduler(OrderRepository orderRepository, CloudinaryService cloudinaryService) {
        this.orderRepository = orderRepository;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Executa todo dia às 03:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredDocuments() {
        log.info("Iniciando limpeza programada de documentos expirados...");

        List<OrderEntity> expiredOrders = orderRepository.findOrdersWithExpiredDocuments(Instant.now());

        for (OrderEntity order : expiredOrders) {
            try {
                deleteFileIfPresent(order.getLabelUrlMe());
                deleteFileIfPresent(order.getLabelUrlCustom());
                deleteFileIfPresent(order.getInvoiceUrl());

                order.setLabelUrlMe(null);
                order.setLabelUrlCustom(null);
                order.setInvoiceUrl(null);
                order.setDocumentExpiryDate(null);

                orderRepository.save(order);
                log.info("Documentos limpos para o pedido: {}", order.getId());
            } catch (Exception e) {
                log.error("Erro ao limpar documentos do pedido {}", order.getId(), e);
            }
        }
    }

    private void deleteFileIfPresent(String url) {
        if (url != null && url.contains("cloudinary")) {
            String publicId = cloudinaryService.extractPublicId(url);
            cloudinaryService.delete(publicId);
        }
    }
}
