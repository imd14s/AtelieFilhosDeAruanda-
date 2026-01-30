package com.atelie.ecommerce.infrastructure.persistence.inventory;

import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryMovementEntity, UUID> {

    // --- CRITICAL FIX: Query Variant Table instead of Product Table ---
    // Counts variants with low stock, considering only active products that have alerts enabled.
    @Query("""
        SELECT COUNT(v) 
        FROM ProductVariantEntity v 
        JOIN v.product p 
        WHERE v.stockQuantity < :threshold 
          AND v.active = true 
          AND p.active = true 
          AND p.alertEnabled = true
    """)
    long countLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) FROM InventoryMovementEntity m WHERE m.product.id = :productId")
    Integer auditCalculatedStock(@Param("productId") UUID productId);
}