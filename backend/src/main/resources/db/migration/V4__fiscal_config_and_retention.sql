-- =============================================
-- V38__fiscal_config_and_retention.sql
-- Adiciona suporte a automação de etiquetas, NF-e multi-provedor e retenção de documentos
-- =============================================

-- 1. Novas colunas na tabela de pedidos para rastreamento de documentos
ALTER TABLE orders 
    ADD COLUMN label_url_me TEXT,
    ADD COLUMN label_url_custom TEXT,
    ADD COLUMN invoice_url TEXT,
    ADD COLUMN tracking_code VARCHAR(100),
    ADD COLUMN shipping_id_external VARCHAR(255),
    ADD COLUMN document_expiry_date TIMESTAMP;

-- 2. Tabela de integrações fiscais (Bling, Tiny, eNotas)
CREATE TABLE fiscal_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(50) NOT NULL UNIQUE, -- 'bling', 'tiny', 'enotas'
    api_key TEXT NOT NULL,
    api_url VARCHAR(255),
    settings_json JSONB DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Configuração global de retenção de documentos (em dias)
-- Inserindo no system_config se não houver
INSERT INTO system_config (config_key, config_value, config_json)
VALUES ('DOCUMENT_RETENTION_DAYS', '30', '{"options": [30, 60, 90], "current": 30}')
ON CONFLICT (config_key) DO NOTHING;

-- 4. Logs de Auditoria para as novas configurações
CREATE INDEX idx_orders_tracking ON orders(tracking_code);
CREATE INDEX idx_orders_expiry ON orders(document_expiry_date);
