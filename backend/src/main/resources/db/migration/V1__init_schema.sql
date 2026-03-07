-- =============================================================================
-- V1__init_schema.sql
-- Schema completo e simplificado do Ateliê Filhos de Aruanda
-- REMOVIDO: products.stock_quantity (verdade agora é na variante)
-- REMOVIDO: tabela legada stock_movements
-- =============================================================================

-- 1. CONFIGURAÇÕES E USUÁRIOS
CREATE TABLE system_config (
    config_key VARCHAR(255) PRIMARY KEY,
    config_value TEXT,
    config_json TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires_at TIMESTAMP,
    mp_customer_id VARCHAR(100),
    photo_url VARCHAR(512),
    google_id VARCHAR(255),
    subscribed_newsletter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Principal',
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CATÁLOGO
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 2) NOT NULL,
    original_price DECIMAL(19, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(512),
    category_id UUID REFERENCES categories(id),
    slug VARCHAR(255) UNIQUE,
    weight DECIMAL(10, 3),
    height DECIMAL(10, 2),
    width DECIMAL(10, 2),
    length DECIMAL(10, 2),
    last_notified_price DECIMAL(19, 2),
    alert_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    gtin VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(19, 2),
    original_price DECIMAL(19, 2),
    attributes_json JSONB,
    image_url VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL
);

CREATE TABLE product_variant_images (
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL
);

-- 3. PEDIDOS E CHECKOUT
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    source VARCHAR(50),
    external_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_amount DECIMAL(19, 2) NOT NULL,
    shipping_street VARCHAR(255),
    shipping_number VARCHAR(20),
    shipping_complement VARCHAR(100),
    shipping_neighborhood VARCHAR(100),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(2),
    shipping_zip_code VARCHAR(10),
    shipping_cost DECIMAL(19, 2),
    shipping_provider VARCHAR(100),
    label_url_me TEXT,
    label_url_custom TEXT,
    invoice_url TEXT,
    tracking_code VARCHAR(100),
    shipping_id_external VARCHAR(255),
    document_expiry_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    total_price DECIMAL(19, 2) NOT NULL,
    product_name VARCHAR(255)
);

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT NOW()
);

-- 4. MARKETING E CUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    value NUMERIC(19, 2) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    min_purchase_value NUMERIC(19, 2) DEFAULT 0,
    owner_id UUID,
    used_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT NOW()
);

-- 5. INFRAESTRUTURA DE EMAIL
CREATE TABLE email_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    role VARCHAR(255),
    store_name VARCHAR(255),
    whatsapp VARCHAR(255),
    email VARCHAR(255),
    store_url VARCHAR(255),
    logo_url TEXT,
    motto TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    audience VARCHAR(50),
    signature_id UUID REFERENCES email_signatures(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    type VARCHAR(50),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    signature_id UUID,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    signature_id UUID,
    automation_type VARCHAR(50),
    automation_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE email_configs (
    id UUID PRIMARY KEY,
    mail_host VARCHAR(255) NOT NULL,
    mail_port INTEGER NOT NULL,
    mail_username VARCHAR(255),
    mail_password VARCHAR(255),
    mail_sender_address VARCHAR(255) NOT NULL,
    mail_sender_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. SERVIÇOS E INTEGRAÇÕES
CREATE TABLE service_providers (
    id UUID PRIMARY KEY,
    service_type VARCHAR(40) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    enabled BOOLEAN NOT NULL,
    priority INT NOT NULL,
    driver_key VARCHAR(160) NOT NULL,
    health_enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT ux_service_providers_type_code UNIQUE (service_type, code)
);

CREATE TABLE service_provider_configs (
    id UUID PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    environment VARCHAR(20) NOT NULL,
    config_json JSONB NOT NULL,
    secrets_ref VARCHAR(200),
    version INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE fiscal_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(50) NOT NULL UNIQUE,
    api_key TEXT NOT NULL,
    api_url VARCHAR(255),
    settings_json JSONB DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE marketplace_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255),
    external_seller_id VARCHAR(255),
    encrypted_credentials TEXT,
    auth_payload TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES marketplace_integrations(id) ON DELETE CASCADE,
    external_product_id VARCHAR(255),
    sku_external VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE product_marketplaces (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, provider_id)
);

-- 7. ESTOQUE E AUDITORIA
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID,
    type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details TEXT,
    performed_by_user_id VARCHAR(255),
    performed_by_user_name VARCHAR(255),
    performed_by_user_email VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    tenant_id VARCHAR(255)
);

-- 8. OUTROS
CREATE TABLE behavior_configs (
    id UUID PRIMARY KEY,
    behavior_json JSONB,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE configuracoes_ia (
    id UUID PRIMARY KEY,
    nome_ia VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    pre_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(300),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ai_moderation_score NUMERIC(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL
);

CREATE TABLE product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

CREATE TABLE product_favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE product_view_history (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    value_json TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABELAS FALTANTES (marketing, pagamento, frete, assinaturas)
-- =========================================================

CREATE TABLE abandoned_cart_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN DEFAULT FALSE,
    triggers JSONB,
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    installments JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipping_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    rules JSONB,
    headers JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(40) NOT NULL,
    provider_code VARCHAR(80) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    match_json JSONB NOT NULL DEFAULT '{}',
    behavior_json JSONB,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    image_url VARCHAR(500),
    base_price NUMERIC(10,2),
    min_products INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 10,
    is_coupon_pack BOOLEAN DEFAULT FALSE,
    coupon_bundle_count INTEGER DEFAULT 0,
    coupon_discount_percentage NUMERIC(5,2) DEFAULT 0,
    coupon_validity_days INTEGER DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_frequency_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    frequency VARCHAR(255) NOT NULL,
    discount_percentage NUMERIC(5,2)
);

CREATE TABLE subscription_plan_products (
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (plan_id, product_id)
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    frequency VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    total_price NUMERIC(10,2) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    next_billing_at TIMESTAMP NOT NULL,
    last_billing_at TIMESTAMP,
    card_token VARCHAR(500),
    shipping_address_id UUID REFERENCES user_addresses(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE product_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    frequency_days INTEGER NOT NULL,
    next_delivery DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media_assets (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(16) NOT NULL,
    storage_key VARCHAR(512) NOT NULL UNIQUE,
    original_filename VARCHAR(255),
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. ÍNDICES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_product_view_history_user ON product_view_history(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscription_items_sub ON subscription_items(subscription_id);
