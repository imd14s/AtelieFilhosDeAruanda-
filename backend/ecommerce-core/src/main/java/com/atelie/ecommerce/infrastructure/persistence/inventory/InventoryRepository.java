package com.atelie.ecommerce.infrastructure.persistence.inventory;

import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryMovementEntity, UUID> {

    // --- CORREÇÃO DE PERFORMANCE ---
    // Consulta direta na tabela de produtos (rápida) ao invés de somar histórico (lenta)
    @Query("SELECT COUNT(p) FROM ProductEntity p WHERE p.stockQuantity < :threshold AND p.active = true AND p.alertEnabled = true")
    long countLowStockProducts(@Param("threshold") int threshold);

    // Mantido apenas para auditoria se necessário, mas não para operação diária
    @Query("SELECT COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) FROM InventoryMovementEntity m WHERE m.product.id = :productId")
    Integer auditCalculatedStock(@Param("productId") UUID productId);
}
