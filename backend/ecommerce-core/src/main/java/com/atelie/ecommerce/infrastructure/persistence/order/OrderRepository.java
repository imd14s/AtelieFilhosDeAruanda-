package com.atelie.ecommerce.infrastructure.persistence.order;

import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    Optional<OrderEntity> findByExternalIdAndSource(String externalId, OrderSource source);
}
