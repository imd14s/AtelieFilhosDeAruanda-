package com.atelie.ecommerce.domain.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<StockMovementEntity, Long> {

    /**
     * Auditoria de estoque calculado POR VARIANTE.
     *
     * Regra de produção:
     * - ENTRADA soma
     * - SAIDA subtrai
     * - Baseado exclusivamente em variantId
     */
    @Query("""
        SELECT COALESCE(SUM(
            CASE
                WHEN m.type = 'IN' THEN m.quantity
                WHEN m.type = 'OUT' THEN -m.quantity
                ELSE 0
            END
        ), 0)
        FROM StockMovementEntity m
        WHERE m.variant.id = :variantId
    """)
    int auditCalculatedStockByVariant(@Param("variantId") Long variantId);

    /**
     * @deprecated NÃO usar em produção.
     * Mistura conceito de produto com variante.
     */
    @Deprecated
    default int auditCalculatedStockByProduct(Long productId) {
        throw new UnsupportedOperationException(
                "Stock audit by product is deprecated. Use variant-based audit."
        );
    }
}
