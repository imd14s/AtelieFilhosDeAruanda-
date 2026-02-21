-- Tipos de Planos de Assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- FIXED (Tipo 1), CUSTOM (Tipo 2)
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price NUMERIC(19, 2), -- Usado para o Tipo 1
    min_products INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Regras de Frequência e Desconto
CREATE TABLE IF NOT EXISTS subscription_frequency_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- WEEKLY, BIWEEKLY, MONTHLY
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    CONSTRAINT fk_freq_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- Produtos permitidos em um plano fixo (Tipo 1)
CREATE TABLE IF NOT EXISTS subscription_plan_products (
    plan_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (plan_id, product_id),
    CONSTRAINT fk_plan_prod_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_prod_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Recriar a tabela de assinaturas ativa para o novo modelo
DROP TABLE IF EXISTS product_subscriptions;

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, CANCELED
    total_price NUMERIC(19, 2) NOT NULL,
    next_billing_at TIMESTAMP NOT NULL,
    last_billing_at TIMESTAMP,
    card_token VARCHAR(255), -- Token do cartão salvo
    shipping_address_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT fk_sub_address FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id)
);

-- Itens de uma assinatura customizada (Tipo 2)
CREATE TABLE IF NOT EXISTS subscription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(19, 2) NOT NULL,
    CONSTRAINT fk_item_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_prod FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_item_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
