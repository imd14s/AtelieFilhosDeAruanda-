-- 1. Categoria Padrão e Específicas
INSERT INTO categories (id, name, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Geral', true, NOW(), NOW()),
(gen_random_uuid(), 'Artigos Religiosos', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Providers (Drivers)
-- Inclui Shipping, Payment e Marketplaces (V3 + V8)
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at) VALUES
(gen_random_uuid(), 'SHIPPING', 'J3', 'J3 Transportadora', true, 10, 'shipping.j3', true, NOW(), NOW()),
(gen_random_uuid(), 'SHIPPING', 'FLAT', 'Frete Fixo', true, 90, 'shipping.flat_rate', false, NOW(), NOW()),
(gen_random_uuid(), 'SHIPPING', 'LOGGI_WEBHOOK', 'Loggi API', false, 20, 'universal.shipping.webhook', true, NOW(), NOW()),
(gen_random_uuid(), 'PAYMENT', 'MERCADO_PAGO', 'Mercado Pago', true, 10, 'payment.mercadopago', true, NOW(), NOW()),
(gen_random_uuid(), 'PAYMENT', 'PIX_BANK_WEBHOOK', 'Banco Pix', false, 20, 'universal.payment.webhook', false, NOW(), NOW()),
(gen_random_uuid(), 'NOTIFICATION', 'WHATSAPP', 'WhatsApp', false, 10, 'universal.notification.webhook', false, NOW(), NOW()),
('d1c9dfd5-53d8-4b7f-bd36-9a7a70ca624a', 'MARKETPLACE', 'mercadolivre', 'Mercado Livre', true, 1, 'mercadolivre', true, NOW(), NOW()),
('646ab43b-69f5-43ab-9f75-e80eaf62ffcb', 'MARKETPLACE', 'tiktok', 'TikTok Shop', true, 2, 'tiktok', true, NOW(), NOW())
ON CONFLICT (service_type, code) DO NOTHING;

-- 3. Configs Padrão para Providers
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version, active, updated_at)
SELECT gen_random_uuid(), id, 'PRODUCTION', '{"apiKey": "CHANGEME"}', 1, true, NOW()
FROM service_providers WHERE code = 'J3'
ON CONFLICT DO NOTHING;

INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version, active, updated_at)
SELECT gen_random_uuid(), id, 'PRODUCTION', '{"price": 15.00}', 1, true, NOW()
FROM service_providers WHERE code = 'FLAT'
ON CONFLICT DO NOTHING;

-- 4. Routing Rules Iniciais
INSERT INTO service_routing_rules (id, service_type, provider_code, enabled, priority, match_json, behavior_json, updated_at) VALUES
(gen_random_uuid(), 'SHIPPING', 'FLAT', true, 999, '{"expression": "true"}', NULL, NOW())
ON CONFLICT DO NOTHING;

-- 5. Produtos de Exemplo (V4)
-- CTE para capturar o ID da categoria
WITH cat AS (
    SELECT id FROM categories WHERE name = 'Artigos Religiosos' LIMIT 1
)
INSERT INTO products (id, name, description, price, category_id, active, stock_quantity, created_at, updated_at, slug) VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'Vela de 7 Dias Branca', 
    'Vela votiva de parafina pura, duração estimada de 7 dias. Ideal para rituais de paz e firmeza de anjo da guarda.', 
    12.90, 
    (SELECT id FROM cat), 
    true, 
    100, 
    NOW(), NOW(),
    'vela-7-dias-branca-a0ee'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'Incenso Artesanal de Arruda', 
    'Incenso natural de arruda para limpeza energética e proteção do ambiente. Caixa com 10 varetas.', 
    8.50, 
    (SELECT id FROM cat), 
    true, 
    200, 
    NOW(), NOW(),
    'incenso-artesanal-arruda-b0ee'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
    'Imagem de Oxalá (20cm)', 
    'Estatueta de gesso resinado de Oxalá, acabamento fino e pintura manual. Altura 20cm.', 
    89.90, 
    (SELECT id FROM cat), 
    true, 
    15, 
    NOW(), NOW(),
    'imagem-oxala-20cm-c0ee'
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
    'Banho de Ervas - Abre Caminho', 
    'Mix de ervas secas selecionadas para banho de descarrego e abertura de caminhos. Contém levante, guiné e alecrim.', 
    25.00, 
    (SELECT id FROM cat), 
    true, 
    50, 
    NOW(), NOW(),
    'banho-ervas-abre-caminho-d0ee'
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 
    'Guia de Proteção Vermelha e Preta', 
    'Guia de proteção confeccionada com miçangas de vidro e firma. Cores vibrantes.', 
    45.00, 
    (SELECT id FROM cat), 
    true, 
    30, 
    NOW(), NOW(),
    'guia-protecao-vermelha-preta-e0ee'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 
    'Defumador Completo com Carvão', 
    'Kit contendo turibulo pequeno, carvão vegetal e mix de resinas sagradas para defumação.', 
    110.00, 
    (SELECT id FROM cat), 
    true, 
    10, 
    NOW(), NOW(),
    'defumador-completo-carvao-f0ee'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Imagens dos Produtos
INSERT INTO product_images (product_id, image_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://placehold.co/600x400/EEE/31343C?text=Vela+7+Dias'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'https://placehold.co/600x400/2E7D32/FFFFFF?text=Incenso+Arruda'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://placehold.co/600x400/FFFFFF/000000?text=Imagem+Oxala'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'https://placehold.co/600x400/81C784/000000?text=Banho+Ervas'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'https://placehold.co/600x400/B71C1C/FFFFFF?text=Guia+Protecao'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'https://placehold.co/600x400/5D4037/FFFFFF?text=Defumador')
ON CONFLICT DO NOTHING;

-- 7. Variantes
INSERT INTO product_variants (id, product_id, sku, price, stock_quantity, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VELA-001', 12.90, 100, true, NOW(), NOW()),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'INC-001', 8.50, 200, true, NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'IMG-OXA-01', 89.90, 15, true, NOW(), NOW()),
(gen_random_uuid(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'BNH-001', 25.00, 50, true, NOW(), NOW()),
(gen_random_uuid(), 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'GUA-001', 45.00, 30, true, NOW(), NOW()),
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'DEF-KIT-01', 110.00, 10, true, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;
