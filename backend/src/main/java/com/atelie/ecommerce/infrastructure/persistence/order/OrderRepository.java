package com.atelie.ecommerce.infrastructure.persistence.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {

    // Soma o total de vendas (apenas pedidos pagos ou entregues)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    BigDecimal sumTotalSales();

    // Conta quantos pedidos estão pendentes
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countPendingOrders();

    long countByStatusNot(com.atelie.ecommerce.domain.order.OrderStatus status);

    java.util.List<OrderEntity> findByCreatedAtAfter(java.time.Instant date);
}
