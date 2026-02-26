package com.atelie.ecommerce.infrastructure.persistence.order;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, UUID> {

        @Query("""
                            SELECT oi.productName as productName, CAST(SUM(oi.quantity) AS int) as quantity
                            FROM OrderItemEntity oi
                            JOIN oi.order o
                            WHERE o.createdAt >= :startDate
                            AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
                            GROUP BY oi.productName
                            ORDER BY SUM(oi.quantity) DESC
                        """)
        List<TopProductProjection> findTopSellingProducts(
                        @Param("startDate") java.time.Instant startDate, Pageable pageable);
}
