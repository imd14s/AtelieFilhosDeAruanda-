package com.atelie.ecommerce.domain.shipping.event;

import com.atelie.ecommerce.domain.shipping.model.TrackingStatus;
import java.time.Instant;
import java.util.UUID;

/**
 * Evento disparado sempre que uma mudança relevante no rastreio é detectada.
 */
public record TrackingUpdatedEvent(
        UUID orderId,
        String trackingCode,
        TrackingStatus oldStatus,
        TrackingStatus newStatus,
        String location,
        String description,
        Instant occurredAt) {
}
