-- V3: Corrige divergências entre entidades JPA e o banco de dados de produção.
-- Usa CREATE TABLE IF NOT EXISTS e ADD COLUMN IF NOT EXISTS para execução idempotente.

-- ============================================================================
-- 1. TABELAS AUSENTES
-- ============================================================================

-- product_subscriptions: tabela de assinaturas recorrentes de produto por usuário
CREATE TABLE IF NOT EXISTS product_subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    frequency_days INTEGER NOT NULL DEFAULT 30,
    next_delivery  DATE NOT NULL DEFAULT CURRENT_DATE,
    status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    price       DECIMAL(19, 2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- ============================================================================
-- 2. COLUNAS AUSENTES EM TABELAS EXISTENTES
-- ============================================================================

-- products: campo de alerta de preço por e-mail
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN NOT NULL DEFAULT false;

-- product_variants: atributos em JSON (cor, tamanho, etc.)
ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS attributes_json JSONB;

-- media_assets: hash SHA-256 para verificação de integridade
ALTER TABLE media_assets
    ADD COLUMN IF NOT EXISTS checksum_sha256 VARCHAR(64);

-- subscription_plans: descrição detalhada do plano
ALTER TABLE subscription_plans
    ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- marketplace_integrations: nome da conta e ID externo do vendedor
ALTER TABLE marketplace_integrations
    ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);

ALTER TABLE marketplace_integrations
    ADD COLUMN IF NOT EXISTS external_seller_id VARCHAR(255);
