-- =============================================================================
-- V1__consolidated_schema.sql
-- Schema completo do Ateliê Filhos de Aruanda
-- Consolidado a partir de: V1 até V37 (apenas DDL)
-- Inclui todas as entidades JPA mapeadas no código-fonte
-- =============================================================================

-- =============================================
-- 1. CONFIGURAÇÕES DO SISTEMA
-- =============================================
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

-- =============================================
-- 2. ENDEREÇOS DE USUÁRIO
-- =============================================
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

-- =============================================
-- 3. CATEGORIAS
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 4. PRODUTOS
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 2) NOT NULL,
    original_price DECIMAL(19, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(512),
    category_id UUID,
    slug VARCHAR(255) UNIQUE,
    weight DECIMAL(10, 3),
    height DECIMAL(10, 2),
    width DECIMAL(10, 2),
    length DECIMAL(10, 2),
    last_notified_price DECIMAL(19, 2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);

-- =============================================
-- 5. VARIANTES DE PRODUTO
-- =============================================
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(19, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- =============================================
-- 6. IMAGENS DE PRODUTO
-- =============================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- =============================================
-- 7. PEDIDOS
-- =============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_source ON orders(source);

-- =============================================
-- 8. ITENS DE PEDIDO
-- =============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID,
    variant_id UUID,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    total_price DECIMAL(19, 2) NOT NULL,
    product_name VARCHAR(255),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_item_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- 9. CARRINHO
-- =============================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_cart_item_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- =============================================
-- 10. CUPONS
-- =============================================
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

-- =============================================
-- 11. NEWSLETTER E NOTIFICAÇÕES
-- =============================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 12. FILA DE EMAIL
-- =============================================
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    type VARCHAR(50),
    campaign_id UUID,
    signature_id UUID,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 13. TEMPLATES DE EMAIL
-- =============================================
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

-- =============================================
-- 14. CONFIGURAÇÕES DE EMAIL
-- =============================================
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

-- =============================================
-- 15. ASSINATURAS DE EMAIL (RODAPÉ)
-- =============================================
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

-- =============================================
-- 16. CAMPANHAS DE EMAIL
-- =============================================
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    audience VARCHAR(50),
    signature_id UUID,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign_signature FOREIGN KEY (signature_id) REFERENCES email_signatures(id) ON DELETE SET NULL
);

ALTER TABLE email_queue ADD CONSTRAINT fk_queue_campaign FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE;

-- =============================================
-- 17. PLANOS DE ASSINATURA
-- =============================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price NUMERIC(19, 2),
    min_products INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 10,
    is_coupon_pack BOOLEAN DEFAULT FALSE,
    coupon_bundle_count INTEGER DEFAULT 0,
    coupon_discount_percentage NUMERIC(5, 2) DEFAULT 0,
    coupon_validity_days INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_frequency_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    CONSTRAINT fk_freq_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

CREATE TABLE subscription_plan_products (
    plan_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (plan_id, product_id),
    CONSTRAINT fk_plan_prod_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_prod_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    plan_name VARCHAR(255),
    frequency VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    total_price NUMERIC(19, 2) NOT NULL,
    next_billing_at TIMESTAMP NOT NULL,
    last_billing_at TIMESTAMP,
    card_token VARCHAR(255),
    shipping_address_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    CONSTRAINT fk_sub_address FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id)
);

CREATE TABLE subscription_items (
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

-- =============================================
-- 18. PROVEDORES DE SERVIÇO (Pagamento/Frete)
-- =============================================
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
    provider_id UUID NOT NULL,
    environment VARCHAR(20) NOT NULL,
    config_json JSONB NOT NULL,
    secrets_ref VARCHAR(200),
    version INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_provider_config FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);

CREATE TABLE shipping_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    rules JSONB,
    headers JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB,
    installments JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 19. CONFIGURAÇÕES DE COMPORTAMENTO / IA
-- =============================================
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

-- =============================================
-- 20. INTEGRAÇÕES COM MARKETPLACES
-- =============================================
CREATE TABLE product_marketplaces (
    product_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    PRIMARY KEY (product_id, provider_id),
    CONSTRAINT fk_product_marketplaces_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_marketplaces_provider FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE
);

CREATE TABLE marketplace_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    encrypted_credentials TEXT,
    auth_payload TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketplace_integrations_provider ON marketplace_integrations(provider);

-- =============================================
-- 21. CARRINHO ABANDONADO
-- =============================================
CREATE TABLE abandoned_cart_configs (
    id UUID PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    triggers JSONB,
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);


-- =============================================
-- 22. AVALIAÇÕES E PERGUNTAS
-- =============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(300),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ai_moderation_score NUMERIC(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    CONSTRAINT fk_review_media_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_media_review ON review_media(review_id);

CREATE TABLE product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP,
    CONSTRAINT fk_questions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_questions_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_product_questions_product ON product_questions(product_id);
CREATE INDEX idx_product_questions_user ON product_questions(user_id);

-- =============================================
-- 23. FAVORITOS E HISTÓRICO
-- =============================================
CREATE TABLE product_favorites (
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_view_history (
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_view_history_user ON product_view_history(user_id);

-- =============================================
-- 24. LOGS DE AUDITORIA
-- =============================================
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

CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by_user_id);

-- =============================================
-- 25. FEATURE FLAGS
-- =============================================
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    value_json TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 26. GERENCIAMENTO DE MÍDIA
-- =============================================
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

-- =============================================
-- 27. MOVIMENTOS DE ESTOQUE
-- =============================================
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    variant_id UUID,
    type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);

-- =============================================
-- 28. REGRAS DE ROTEAMENTO DE SERVIÇOS
-- =============================================
CREATE TABLE service_routing_rules (
    id UUID PRIMARY KEY,
    service_type VARCHAR(40) NOT NULL,
    provider_code VARCHAR(80) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL,
    match_json JSONB NOT NULL,
    behavior_json JSONB,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 29. INTEGRAÇÕES DE PRODUTO COM MARKETPLACES
-- =============================================
CREATE TABLE product_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    integration_id UUID NOT NULL,
    external_product_id VARCHAR(255),
    sku_external VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_integration_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_integration_marketplace FOREIGN KEY (integration_id) REFERENCES marketplace_integrations(id) ON DELETE CASCADE
);

-- =============================================
-- 30. USO DE CUPONS
-- =============================================
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL,
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);

