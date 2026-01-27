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

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countPendingOrders();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.status = 'PAID'")
    java.math.BigDecimal totalSalesPaid();
}
