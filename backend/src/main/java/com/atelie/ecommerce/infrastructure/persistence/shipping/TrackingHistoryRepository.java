package com.atelie.ecommerce.infrastructure.persistence.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TrackingHistoryRepository extends JpaRepository<TrackingHistoryEntity, UUID> {
    List<TrackingHistoryEntity> findByOrderIdOrderByOccurredAtDesc(UUID orderId);

    List<TrackingHistoryEntity> findByTrackingCodeOrderByOccurredAtDesc(String trackingCode);
}
