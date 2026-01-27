CREATE TABLE product_integrations (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- MERCADO_LIVRE, TIKTOK
    external_id VARCHAR(255) NOT NULL,     -- Ex: MLB-123456
    sku_external VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uk_integration_external UNIQUE (integration_type, external_id)
);
