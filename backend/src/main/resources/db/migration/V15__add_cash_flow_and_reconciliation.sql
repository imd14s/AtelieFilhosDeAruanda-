-- Migração para o Módulo de Conciliação Bancária e Fluxo de Caixa

-- 1. Tabela de Lançamentos de Fluxo de Caixa (Saldo Pendente e Disponível)
CREATE TABLE IF NOT EXISTS cash_flow_entries (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    external_id VARCHAR(255),
    gross_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    total_fees DECIMAL(12,2) DEFAULT 0.00,
    type VARCHAR(20) NOT NULL, -- INFLOW, OUTFLOW
    status VARCHAR(20) NOT NULL, -- PENDING, AVAILABLE, SETTLED, CANCELED, DISCREPANCY
    expected_release_date TIMESTAMP WITH TIME ZONE,
    actual_release_date TIMESTAMP WITH TIME ZONE,
    gateway VARCHAR(50), -- MERCADO_PAGO, PIX
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cash_flow_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_cash_flow_status_date ON cash_flow_entries(status, expected_release_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_order ON cash_flow_entries(order_id);

-- 2. Tabela de Conciliação Bancária (Auditoria e Discrepâncias)
CREATE TABLE IF NOT EXISTS banking_reconciliations (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    external_id VARCHAR(255),
    system_amount DECIMAL(12,2) NOT NULL,
    gateway_amount DECIMAL(12,2) NOT NULL,
    fee_difference DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL, -- MATCHED, DISCREPANCY, CHARGEBACK, PENDING
    discrepancy_reason TEXT,
    reconciled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reconciliation_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_order ON banking_reconciliations(order_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON banking_reconciliations(status);
