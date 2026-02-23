-- V36__enrich_product_seed_data.sql
-- Enriquecimento de dados de produtos: Peso, Dimensões e Mídias Adicionais

-- 0. Restaurar produto faltante (caso tenha sido removido acidentalmente)
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, created_at, updated_at, slug)
SELECT '22222222-2222-2222-2222-222222222222', 'Chapéu de Palha Simples Extra', 'Chapéu de palha natural resistente, ideal para trabalhos de campo ou oferendas.', 35.00, 40.00, '02222222-2222-2222-2222-222222222222', true, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800', 100, NOW(), NOW(), 'chapeu-palha-222'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = '22222222-2222-2222-2222-222222222222');

-- 1. Atualização de Logística (Peso em KG e Dimensões em CM)
UPDATE products SET weight = 0.500, height = 15.0, width = 10.0, length = 10.0 WHERE id = '11111111-1111-1111-1111-111111111111'; -- Vela 7 Dias
UPDATE products SET weight = 0.300, height = 8.0, width = 8.0, length = 8.0 WHERE id = '11111111-1111-1111-1111-111111111112'; -- Vela Mel
UPDATE products SET weight = 0.200, height = 12.0, width = 30.0, length = 35.0 WHERE id = '22222222-2222-2222-2222-222222222221'; -- Chapéu Panamá
UPDATE products SET weight = 0.150, height = 10.0, width = 28.0, length = 32.0 WHERE id = '22222222-2222-2222-2222-222222222222'; -- Chapéu Palha
UPDATE products SET weight = 0.100, height = 5.0, width = 10.0, length = 15.0 WHERE id = '33333333-3333-3333-3333-333333333331'; -- Banho Ervas
UPDATE products SET weight = 0.120, height = 4.0, width = 8.0, length = 12.0 WHERE id = '33333333-3333-3333-3333-333333333332'; -- Defumação
UPDATE products SET weight = 1.500, height = 25.0, width = 15.0, length = 15.0 WHERE id = '44444444-4444-4444-4444-444444444441'; -- Estátua Oxalá
UPDATE products SET weight = 1.200, height = 20.0, width = 12.0, length = 12.0 WHERE id = '44444444-4444-4444-4444-444444444442'; -- Imagem Iemanjá

-- 2. Adição de Mídias extras para a galeria (usando ON CONFLICT para evitar erros se rodar manual)
INSERT INTO product_images (product_id, image_url) VALUES 
('11111111-1111-1111-1111-111111111112', 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=800'),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800'),
('33333333-3333-3333-3333-333333333331', 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=800'),
('33333333-3333-3333-3333-333333333332', 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800'),
('44444444-4444-4444-4444-444444444441', 'https://images.unsplash.com/photo-1590736910118-246471457493?q=80&w=800'),
('44444444-4444-4444-4444-444444444442', 'https://images.unsplash.com/photo-1578321272176-b7bbc067985c?q=80&w=800')
ON CONFLICT DO NOTHING;
