-- =============================================
-- V7__add_stock_movements.sql
-- Tabela para auditoria de movimentação de estoque
-- =============================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity_change INTEGER NOT NULL,
    resulting_stock INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- SALE, ADJUSTMENT, RETURN, INITIAL_LOAD
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255)
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id);
