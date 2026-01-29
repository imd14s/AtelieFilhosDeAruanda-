package com.atelie.ecommerce.infrastructure.persistence.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    List<OrderEntity> findByStatus(String status);

    @Query("SELECT SUM(o.totalAmount) FROM OrderEntity o WHERE o.status = 'PAID'")
    BigDecimal totalSalesPaid();

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countPendingOrders();
}
