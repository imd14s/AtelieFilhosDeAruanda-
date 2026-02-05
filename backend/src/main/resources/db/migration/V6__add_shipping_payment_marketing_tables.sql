-- 1. Shipping Providers
CREATE TABLE shipping_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    rules JSONB,
    headers JSONB, -- Para headers de autenticação se necessário
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Payment Providers
CREATE TABLE payment_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    installments JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    value NUMERIC(19, 2) NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 4. Abandoned Cart Config
CREATE TABLE abandoned_cart_configs (
    id UUID PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    triggers JSONB, -- Lista de configs de delay e template
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 5. Alter Products: Add Slug
ALTER TABLE products ADD COLUMN slug VARCHAR(255);
CREATE UNIQUE INDEX idx_products_slug ON products(slug);

-- Update existing products to have a slug (fallback to ID if name is empty, mostly for safety)
-- This is a simple heuristic, strict slug generation might need app logic, but DB update is needed to avoid constraint violation if not nullable.
-- However, we made it nullable initially (no NOT NULL constraint above).
-- Let's make it unique but allow nulls? No, URLs need to be clean.
-- We will try to update it based on name + id to ensure uniqueness for existing data
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || SUBSTRING(CAST(id AS VARCHAR), 1, 4)
WHERE slug IS NULL;

-- Now enforce uniqueness if required, but ideally we handle collision in code.
-- The index `idx_products_slug` already enforces uniqueness if we want it.
