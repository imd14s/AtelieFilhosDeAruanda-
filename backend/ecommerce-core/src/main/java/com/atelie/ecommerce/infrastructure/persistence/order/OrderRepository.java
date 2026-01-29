package com.atelie.ecommerce.infrastructure.persistence.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    
    // Suporte a paginação
    Page<OrderEntity> findAll(Pageable pageable);

    @Query("SELECT SUM(o.totalAmount) FROM OrderEntity o WHERE o.status = 'PAID'")
    BigDecimal totalSalesPaid();

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countPendingOrders();
}
