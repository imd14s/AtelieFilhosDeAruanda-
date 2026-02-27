-- Migração para consolidar o Motor de Lucratividade e Provisão Tributária
-- Adiciona custo de produto e tabelas de ledger e provisão

-- 1. Adicionar custo base às variantes de produto
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0.00;

COMMENT ON COLUMN product_variants.cost_price IS 'Preço de custo da variante para cálculo de margem';

-- 2. Criar tabela de Razão Financeira (Financial Ledger)
CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL UNIQUE,
    gross_amount DECIMAL(12,2) NOT NULL,
    gateway_fee DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(12,2) NOT NULL,
    taxes_amount DECIMAL(12,2) NOT NULL,
    icms_amount DECIMAL(12,2) DEFAULT 0.00,
    pis_amount DECIMAL(12,2) DEFAULT 0.00,
    cofins_amount DECIMAL(12,2) DEFAULT 0.00,
    iss_amount DECIMAL(12,2) DEFAULT 0.00,
    product_cost DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ledger_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_order ON financial_ledger(order_id);

-- 3. Criar tabela de Provisão Tributária Mensal
CREATE TABLE IF NOT EXISTS tax_provisions (
    id UUID PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_taxes DECIMAL(12,2) NOT NULL,
    total_icms DECIMAL(12,2) DEFAULT 0.00,
    total_pis DECIMAL(12,2) DEFAULT 0.00,
    total_cofins DECIMAL(12,2) DEFAULT 0.00,
    estimated_net_profit DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PROVISIONED',
    UNIQUE(month, year)
);

CREATE INDEX IF NOT EXISTS idx_tax_provisions_period ON tax_provisions(year, month);
