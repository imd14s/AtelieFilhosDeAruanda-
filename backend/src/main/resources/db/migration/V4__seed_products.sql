-- Criação de Categoria Específica
INSERT INTO categories (id, name, active) 
VALUES (gen_random_uuid(), 'Artigos Religiosos', true)
ON CONFLICT (name) DO NOTHING;

-- CTE (Common Table Expression) para capturar o ID da categoria
WITH cat AS (
    SELECT id FROM categories WHERE name = 'Artigos Religiosos' LIMIT 1
)
INSERT INTO products (id, name, description, price, category_id, active, stock_quantity, created_at, updated_at) VALUES
-- Produto 1
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'Vela de 7 Dias Branca', 
    'Vela votiva de parafina pura, duração estimada de 7 dias. Ideal para rituais de paz e firmeza de anjo da guarda.', 
    12.90, 
    (SELECT id FROM cat), 
    true, 
    100, 
    NOW(), NOW()
),
-- Produto 2
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'Incenso Artesanal de Arruda', 
    'Incenso natural de arruda para limpeza energética e proteção do ambiente. Caixa com 10 varetas.', 
    8.50, 
    (SELECT id FROM cat), 
    true, 
    200, 
    NOW(), NOW()
),
-- Produto 3
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
    'Imagem de Oxalá (20cm)', 
    'Estatueta de gesso resinado de Oxalá, acabamento fino e pintura manual. Altura 20cm.', 
    89.90, 
    (SELECT id FROM cat), 
    true, 
    15, 
    NOW(), NOW()
),
-- Produto 4
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
    'Banho de Ervas - Abre Caminho', 
    'Mix de ervas secas selecionadas para banho de descarrego e abertura de caminhos. Contém levante, guiné e alecrim.', 
    25.00, 
    (SELECT id FROM cat), 
    true, 
    50, 
    NOW(), NOW()
),
-- Produto 5
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 
    'Guia de Proteção Vermelha e Preta', 
    'Guia de proteção confeccionada com miçangas de vidro e firma. Cores vibrantes.', 
    45.00, 
    (SELECT id FROM cat), 
    true, 
    30, 
    NOW(), NOW()
),
-- Produto 6
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 
    'Defumador Completo com Carvão', 
    'Kit contendo turibulo pequeno, carvão vegetal e mix de resinas sagradas para defumação.', 
    110.00, 
    (SELECT id FROM cat), 
    true, 
    10, 
    NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Imagens para os Produtos (Usando Placeholders por enquanto)
INSERT INTO product_images (product_id, image_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://placehold.co/600x400/EEE/31343C?text=Vela+7+Dias'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'https://placehold.co/600x400/2E7D32/FFFFFF?text=Incenso+Arruda'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://placehold.co/600x400/FFFFFF/000000?text=Imagem+Oxala'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'https://placehold.co/600x400/81C784/000000?text=Banho+Ervas'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'https://placehold.co/600x400/B71C1C/FFFFFF?text=Guia+Protecao'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'https://placehold.co/600x400/5D4037/FFFFFF?text=Defumador');

-- Inserir Variantes (Obrigatório para o carrinho funcionar corretamente)
INSERT INTO product_variants (id, product_id, sku, price, stock_quantity, active, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VELA-001', 12.90, 100, true, NOW(), NOW()),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'INC-001', 8.50, 200, true, NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'IMG-OXA-01', 89.90, 15, true, NOW(), NOW()),
(gen_random_uuid(), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'BNH-001', 25.00, 50, true, NOW(), NOW()),
(gen_random_uuid(), 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'GUA-001', 45.00, 30, true, NOW(), NOW()),
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'DEF-KIT-01', 110.00, 10, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
