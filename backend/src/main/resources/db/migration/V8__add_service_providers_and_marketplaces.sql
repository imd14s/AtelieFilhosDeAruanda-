-- V8__add_product_marketplace_relationship.sql

-- A tabela service_providers já existe (criada na V1), então apenas criamos a tabela de junção
CREATE TABLE IF NOT EXISTS product_marketplaces (
    product_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    PRIMARY KEY (product_id, provider_id),
    CONSTRAINT fk_product_marketplaces_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_marketplaces_provider FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE
);

-- Semeia provedores iniciais se não existirem
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES 
('d1c9dfd5-53d8-4b7f-bd36-9a7a70ca624a', 'MARKETPLACE', 'mercadolivre', 'Mercado Livre', true, 1, 'mercadolivre', true, NOW(), NOW()),
('646ab43b-69f5-43ab-9f75-e80eaf62ffcb', 'MARKETPLACE', 'tiktok', 'TikTok Shop', true, 2, 'tiktok', true, NOW(), NOW())
ON CONFLICT (service_type, code) DO NOTHING;
