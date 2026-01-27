package com.atelie.ecommerce.infrastructure.persistence.inventory;

import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryMovementEntity, UUID> {

    // --- MÉTODO RESTAURADO (Usado pelo InventoryService) ---
    @Query("SELECT COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) FROM InventoryMovementEntity m WHERE m.product.id = :productId")
    Integer calculateCurrentStock(@Param("productId") UUID productId);

    // --- MÉTODO CORRIGIDO (Usado pelo Dashboard) ---
    @Query(value = """
        SELECT COUNT(*) FROM (
            SELECT product_id, 
            SUM(CASE WHEN type = 'IN' THEN quantity WHEN type = 'OUT' THEN -quantity ELSE 0 END) as total_qty 
            FROM inventory_movements 
            GROUP BY product_id
        ) as sub 
        WHERE sub.total_qty < :threshold
    """, nativeQuery = true)
    long countLowStockProducts(@Param("threshold") int threshold);
}
