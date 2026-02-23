-- V35__seed_test_data.sql
-- Seed de dados realistas para o Ateliê Filhos de Aruanda (UUIDs HEX válidos)

-- 1. Categorias
INSERT INTO categories (id, name, active, created_at, updated_at) VALUES 
('01111111-1111-1111-1111-111111111111', 'Velas', true, NOW(), NOW()),
('02222222-2222-2222-2222-222222222222', 'Chapéus', true, NOW(), NOW()),
('03333333-3333-3333-3333-333333333333', 'Ervas', true, NOW(), NOW()),
('04444444-4444-4444-4444-444444444444', 'Imagens', true, NOW(), NOW());

-- 2. Produtos
-- Velas
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, created_at, updated_at, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'Vela de 7 Dias Branca Premium', 'Vela de 7 dias de alta qualidade, queima uniforme e sem cheiro forte. Ideal para rituais e orações.', 15.90, 18.00, '01111111-1111-1111-1111-111111111111', true, 'https://images.unsplash.com/photo-1602872030219-cdebb1008034?q=80&w=800', 50, NOW(), NOW(), 'vela-7-dias-branca-111'),
('11111111-1111-1111-1111-111111111112', 'Vela Artesanal Mel e Canela', 'Vela feita à mão com cera de abelha natural e essência de canela. Atrai prosperidade e doçura.', 25.00, 30.00, '01111111-1111-1111-1111-111111111111', true, 'https://images.unsplash.com/photo-1596435707700-6264292b8614?q=80&w=800', 20, NOW(), NOW(), 'vela-artesanal-mel-112');

-- Chapéus
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, created_at, updated_at, slug) VALUES 
('22222222-2222-2222-2222-222222222221', 'Chapéu Panamá Zé Pilintra', 'O clássico chapéu Panamá de palha clara com fita vermelha. Sinônimo de elegância e malandragem.', 89.90, 110.00, '02222222-2222-2222-2222-222222222222', true, 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=800', 15, NOW(), NOW(), 'chapeu-panama-ze-221'),
('22222222-2222-2222-2222-222222222222', 'Chapéu de Palha Simples Extra', 'Chapéu de palha natural resistente, ideal para trabalhos de campo ou oferendas.', 35.00, 40.00, '02222222-2222-2222-2222-222222222222', true, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800', 100, NOW(), NOW(), 'chapeu-palha-222');

-- Ervas
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, created_at, updated_at, slug) VALUES 
('33333333-3333-3333-3333-333333333331', 'Banho de Ervas Descarrego Forte', 'Mix de 7 ervas (arruda, guiné, espada de são jorge, etc) para limpeza energética profunda.', 12.50, 15.00, '03333333-3333-3333-3333-333333333333', true, 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800', 200, NOW(), NOW(), 'banho-ervas-descarrego-331'),
('33333333-3333-3333-3333-333333333332', 'Defumação Pronta Prosperidade', 'Mistura de ervas secas e resinas naturais para atrair bons fluídos e abundância para o lar.', 18.00, 22.00, '03333333-3333-3333-3333-333333333333', true, 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800', 80, NOW(), NOW(), 'defumacao-prosperidade-332');

-- Imagens
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, created_at, updated_at, slug) VALUES 
('44444444-4444-4444-4444-444444444441', 'Estátua de Oxalá em Resina 25cm', 'Escultura detalhada de Oxalá com opaxorô. Pintura artesanal de alta qualidade.', 120.00, 150.00, '04444444-4444-4444-4444-444444444444', true, 'https://images.unsplash.com/photo-1590736910118-246471457493?q=80&w=800', 5, NOW(), NOW(), 'estatua-oxala-441'),
('44444444-4444-4444-4444-444444444442', 'Imagem de Iemanjá 20cm Luxo', 'Imagem de Iemanjá sobre as ondas, detalhes em pérolas e brilho. Peça exclusiva para altar.', 95.00, 110.00, '04444444-4444-4444-4444-444444444444', true, 'https://images.unsplash.com/photo-1578321272176-b7bbc067985c?q=80&w=800', 8, NOW(), NOW(), 'imagem-iemanja-442');

-- 3. Imagens Adicionais de Produtos
INSERT INTO product_images (product_id, image_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1572726710706-7996ee7b4e50?q=80&w=800'),
('22222222-2222-2222-2222-222222222221', 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=800');

-- 4. Variantes de Produtos
INSERT INTO product_variants (id, product_id, sku, stock_quantity, price, active, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VELA-7D-BR-01', 50, 15.90, true, NOW(), NOW()),
('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111112', 'VELA-MEL-01', 20, 25.00, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222221', 'CHAP-PAN-01', 15, 89.90, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333331', 'ERVA-DESC-01', 200, 12.50, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444441', 'IMG-OXALA-01', 5, 120.00, true, NOW(), NOW());

-- 5. Usuários (Clientes)
-- Senha: 12345678 (BCrypt)
INSERT INTO users (id, name, email, password, role, active, email_verified, created_at, updated_at) VALUES 
('55555555-5555-5555-5555-555555555555', 'João Silva', 'joao.cliente@teste.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'CUSTOMER', true, true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Maria Souza', 'maria.cliente@teste.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'CUSTOMER', true, true, NOW(), NOW());

-- 6. Endereços
INSERT INTO user_addresses (id, user_id, street, number, neighborhood, city, state, zip_code, complement, is_default, created_at, updated_at) VALUES 
('ad111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01010-000', 'Apto 42', true, NOW(), NOW()),
('ad222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Avenida Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', NULL, true, NOW(), NOW());

-- 7. Pedidos (Vários estados)
-- Pedido Entregue (João)
INSERT INTO orders (id, user_id, status, source, external_id, customer_name, customer_email, total_amount, created_at, updated_at) VALUES 
('00000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'DELIVERED', 'STOREFRONT', 'EXT-001', 'João Silva', 'joao.cliente@teste.com', 105.80, NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days');
INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, product_name) VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2, 15.90, 31.80, 'Vela de 7 Dias Branca Premium'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222221', 1, 89.90, 89.90, 'Chapéu Panamá Zé Pilintra');

-- Pedido Pago (Maria)
INSERT INTO orders (id, user_id, status, source, external_id, customer_name, customer_email, total_amount, created_at, updated_at) VALUES 
('00000000-0000-0000-0000-000000000002', '66666666-6666-6666-6666-666666666666', 'PAID', 'STOREFRONT', 'EXT-002', 'Maria Souza', 'maria.cliente@teste.com', 120.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, product_name) VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444441', 1, 120.00, 120.00, 'Estátua de Oxalá em Resina 25cm');

-- Pedido Cancelado (João)
INSERT INTO orders (id, user_id, status, source, external_id, customer_name, customer_email, total_amount, created_at, updated_at) VALUES 
('00000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'CANCELED', 'STOREFRONT', 'EXT-003', 'João Silva', 'joao.cliente@teste.com', 25.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days');
INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, product_name) VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111112', 1, 25.00, 25.00, 'Vela Artesanal Mel e Canela');

-- 8. Marketing (Cupons e Newsletter)
INSERT INTO coupons (id, code, type, value, start_date, end_date, active, created_at) VALUES 
(gen_random_uuid(), 'BEMVINDO10', 'PERCENTAGE', 10.00, NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 year', true, NOW()),
(gen_random_uuid(), 'ARUANDA5', 'FIXED', 5.00, NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 year', true, NOW());

INSERT INTO newsletter_subscribers (id, email, active, subscribed_at) VALUES 
(gen_random_uuid(), 'joao.cliente@teste.com', true, NOW()),
(gen_random_uuid(), 'maria.cliente@teste.com', true, NOW());

-- 9. Reviews
INSERT INTO reviews (id, user_id, product_id, rating, comment, status, created_at) VALUES 
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 5, 'Vela excelente, queima muito bem!', 'APPROVED', NOW()),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222221', 4, 'Chapéu muito bonito e bem acabado.', 'APPROVED', NOW());

-- 10. Subscrições
INSERT INTO subscription_plans (id, type, name, description, base_price, active) VALUES 
('00000000-0000-0000-0000-000000000001', 'FIXED', 'Plano Luz Diária', 'Receba velas de 7 dias todo mês em sua casa.', 50.00, true);

INSERT INTO subscriptions (id, user_id, plan_id, frequency, status, total_price, next_billing_at, created_at, plan_name) VALUES 
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'MONTHLY', 'ACTIVE', 50.00, NOW() + INTERVAL '30 days', NOW(), 'Plano Luz Diária');
