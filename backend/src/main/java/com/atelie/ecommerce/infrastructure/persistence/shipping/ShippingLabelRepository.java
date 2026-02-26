package com.atelie.ecommerce.infrastructure.persistence.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ShippingLabelRepository extends JpaRepository<ShippingLabelEntity, UUID> {
    Optional<ShippingLabelEntity> findByOrderId(UUID orderId);

    Optional<ShippingLabelEntity> findByExternalId(String externalId);
}
