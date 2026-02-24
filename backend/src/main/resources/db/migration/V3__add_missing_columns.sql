-- V3: Adiciona colunas ausentes que existem nas entidades JPA mas não foram incluídas na migration V1.
-- Todas as instruções usam "ADD COLUMN IF NOT EXISTS" para segurança idempotente.

-- products: campo de alerta de preço por e-mail
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN NOT NULL DEFAULT false;

-- product_variants: atributos como JSON (cor, tamanho, etc.)
ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS attributes_json JSONB;

-- media_assets: hash SHA-256 para verificação de integridade
ALTER TABLE media_assets
    ADD COLUMN IF NOT EXISTS checksum_sha256 VARCHAR(64);

-- product_subscriptions: frequência e próxima entrega para assinaturas recorrentes
ALTER TABLE product_subscriptions
    ADD COLUMN IF NOT EXISTS frequency_days INTEGER NOT NULL DEFAULT 30;

ALTER TABLE product_subscriptions
    ADD COLUMN IF NOT EXISTS next_delivery DATE NOT NULL DEFAULT CURRENT_DATE;

-- subscription_plans: descrição detalhada do plano de assinatura
ALTER TABLE subscription_plans
    ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- marketplace_integrations: nome da conta e ID externo do vendedor
ALTER TABLE marketplace_integrations
    ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);

ALTER TABLE marketplace_integrations
    ADD COLUMN IF NOT EXISTS external_seller_id VARCHAR(255);
