package com.atelie.ecommerce.domain.inventory;

import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface InventoryRepository extends JpaRepository<InventoryMovementEntity, UUID> {

    @Query("""
                SELECT COALESCE(SUM(
                    CASE
                        WHEN m.type = 'IN' THEN m.quantity
                        WHEN m.type = 'OUT' THEN -m.quantity
                        ELSE 0
                    END
                ), 0)
                FROM InventoryMovementEntity m
                WHERE m.variantId = :variantId
            """)
    int auditCalculatedStockByVariant(@Param("variantId") UUID variantId);
}
