-- Extensão para UUIDs (Postgres)
${PGCRYPTO_EXTENSION}

-- 1. Usuários e Autenticação
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- 2. Catálogo (Categorias, Produtos e Variantes)
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    price NUMERIC(19,2) NOT NULL,
    category_id UUID NOT NULL,
    active BOOLEAN NOT NULL,
    image_url VARCHAR(255),
    attributes JSONB DEFAULT '{}',
    alert_enabled BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);

CREATE TABLE product_images (
    product_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    gtin VARCHAR(20),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(19, 2),
    active BOOLEAN DEFAULT TRUE,
    attributes_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX ux_product_variant_gtin ON product_variants(gtin) WHERE gtin IS NOT NULL;

CREATE TABLE product_integrations (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    sku_external VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uk_integration_external UNIQUE (integration_type, external_id)
);

-- 3. Estoque
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
CREATE INDEX idx_inventory_product ON inventory_movements(product_id);
CREATE UNIQUE INDEX ux_inventory_idempotency ON inventory_movements (variant_id, type, reference_id) WHERE reference_id IS NOT NULL;

-- 4. Pedidos e Faturamento
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_amount DECIMAL(19, 2) NOT NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_external ON orders(external_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    total_price DECIMAL(38, 2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    external_invoice_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    xml_url VARCHAR(500),
    pdf_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE INDEX idx_invoices_order ON invoices(order_id);

-- 5. Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(16) NOT NULL,
  storage_key VARCHAR(512) NOT NULL UNIQUE,
  original_filename VARCHAR(255),
  mime_type VARCHAR(128) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  checksum_sha256 VARCHAR(64),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_public ON media_assets(is_public);

-- 6. Tabela de Configuração do Sistema (Dynamic Config)
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255),
    config_json JSONB
);

-- 7. Service Routing Rules e Providers (Logística e Integrações)
CREATE TABLE service_routing_rules (
    id UUID PRIMARY KEY,
    service_type VARCHAR(40) NOT NULL,
    provider_code VARCHAR(80) NOT NULL,
    enabled BOOLEAN NOT NULL,
    priority INT NOT NULL,
    match_json JSONB NOT NULL,
    behavior_json JSONB,
    updated_at TIMESTAMP NOT NULL
);

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

-- CORREÇÃO: version alterado de BIGINT para INTEGER para casar com Java (Integer)
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
