-- =============================================================================
-- V2__consolidated_seeds.sql
-- Dados iniciais do Ateliê Filhos de Aruanda
-- Consolidado a partir de: V25, V27, V31, V33, V35, V36
-- =============================================================================

-- =============================================
-- 1. CATEGORIAS
-- =============================================
INSERT INTO categories (id, name, active, created_at, updated_at) VALUES
('01111111-1111-1111-1111-111111111111', 'Velas', true, NOW(), NOW()),
('02222222-2222-2222-2222-222222222222', 'Chapéus', true, NOW(), NOW()),
('03333333-3333-3333-3333-333333333333', 'Ervas', true, NOW(), NOW()),
('04444444-4444-4444-4444-444444444444', 'Imagens', true, NOW(), NOW());

-- =============================================
-- 2. PRODUTOS
-- =============================================
-- Velas
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, weight, height, width, length, created_at, updated_at, slug) VALUES
('11111111-1111-1111-1111-111111111111', 'Vela de 7 Dias Branca Premium', 'Vela de 7 dias de alta qualidade, queima uniforme e sem cheiro forte. Ideal para rituais e orações.', 15.90, 18.00, '01111111-1111-1111-1111-111111111111', true, 'https://images.unsplash.com/photo-1602872030219-cdebb1008034?q=80&w=800', 50, 0.500, 15.0, 10.0, 10.0, NOW(), NOW(), 'vela-7-dias-branca-111'),
('11111111-1111-1111-1111-111111111112', 'Vela Artesanal Mel e Canela', 'Vela feita à mão com cera de abelha natural e essência de canela. Atrai prosperidade e doçura.', 25.00, 30.00, '01111111-1111-1111-1111-111111111111', true, 'https://images.unsplash.com/photo-1596435707700-6264292b8614?q=80&w=800', 20, 0.300, 8.0, 8.0, 8.0, NOW(), NOW(), 'vela-artesanal-mel-112');

-- Chapéus
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, weight, height, width, length, created_at, updated_at, slug) VALUES
('22222222-2222-2222-2222-222222222221', 'Chapéu Panamá Zé Pilintra', 'O clássico chapéu Panamá de palha clara com fita vermelha. Sinônimo de elegância e malandragem.', 89.90, 110.00, '02222222-2222-2222-2222-222222222222', true, 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=800', 15, 0.200, 12.0, 30.0, 35.0, NOW(), NOW(), 'chapeu-panama-ze-221'),
('22222222-2222-2222-2222-222222222222', 'Chapéu de Palha Simples Extra', 'Chapéu de palha natural resistente, ideal para trabalhos de campo ou oferendas.', 35.00, 40.00, '02222222-2222-2222-2222-222222222222', true, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800', 100, 0.150, 10.0, 28.0, 32.0, NOW(), NOW(), 'chapeu-palha-222');

-- Ervas
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, weight, height, width, length, created_at, updated_at, slug) VALUES
('33333333-3333-3333-3333-333333333331', 'Kit Banho de Ervas Oxum', 'Kit completo para banho de limpeza e atração com ervas frescas da Oxum.', 22.00, 28.00, '03333333-3333-3333-3333-333333333333', true, 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=800', 80, 0.100, 5.0, 10.0, 15.0, NOW(), NOW(), 'kit-banho-ervas-oxum-331'),
('33333333-3333-3333-3333-333333333332', 'Defumador de Alecrim e Sálvia', 'Defumador artesanal pronto para uso. Purifica ambientes e afasta energias negativas.', 18.50, 22.00, '03333333-3333-3333-3333-333333333333', true, 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800', 60, 0.120, 4.0, 8.0, 12.0, NOW(), NOW(), 'defumador-alecrim-salvia-332');

-- Imagens
INSERT INTO products (id, name, description, price, original_price, category_id, active, image_url, stock_quantity, weight, height, width, length, created_at, updated_at, slug) VALUES
('44444444-4444-4444-4444-444444444441', 'Estátua de Oxalá em Resina 25cm', 'Imagem de Oxalá em resina pintada à mão com detalhes em dourado. Beleza e devoção.', 120.00, 150.00, '04444444-4444-4444-4444-444444444444', true, 'https://images.unsplash.com/photo-1590736910118-246471457493?q=80&w=800', 10, 1.500, 25.0, 15.0, 15.0, NOW(), NOW(), 'estatua-oxala-resina-441'),
('44444444-4444-4444-4444-444444444442', 'Imagem de Iemanjá Azul 20cm', 'Imagem de Iemanjá em cerâmica pintada à mão, com manto azul e coroa prateada.', 95.00, 120.00, '04444444-4444-4444-4444-444444444444', true, 'https://images.unsplash.com/photo-1578321272176-b7bbc067985c?q=80&w=800', 8, 1.200, 20.0, 12.0, 12.0, NOW(), NOW(), 'imagem-iemanja-azul-442');

-- =============================================
-- 3. VARIANTES DE PRODUTO
-- =============================================
INSERT INTO product_variants (id, product_id, sku, stock_quantity, price, active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'VELA-BRANCA-01', 50, 15.90, true, NOW(), NOW()),
('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111112', 'VELA-MEL-01', 20, 25.00, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222221', 'CHAPEU-PAN-01', 15, 89.90, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'CHAPEU-PAL-01', 100, 35.00, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333331', 'ERVA-BANHO-01', 80, 22.00, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333332', 'ERVA-DESC-01', 200, 12.50, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444441', 'IMG-OXALA-01', 5, 120.00, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444442', 'IMG-IEMANJA-01', 8, 95.00, true, NOW(), NOW());

-- =============================================
-- 4. IMAGENS ADICIONAIS DE PRODUTOS
-- =============================================
INSERT INTO product_images (product_id, image_url) VALUES
('11111111-1111-1111-1111-111111111112', 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=800'),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800'),
('33333333-3333-3333-3333-333333333331', 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=800'),
('33333333-3333-3333-3333-333333333332', 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800'),
('44444444-4444-4444-4444-444444444441', 'https://images.unsplash.com/photo-1590736910118-246471457493?q=80&w=800'),
('44444444-4444-4444-4444-444444444442', 'https://images.unsplash.com/photo-1578321272176-b7bbc067985c?q=80&w=800');

-- =============================================
-- 5. USUÁRIOS DE TESTE
-- Senha de todos: 12345678 (BCrypt)
-- =============================================
INSERT INTO users (id, name, email, password, role, active, email_verified, created_at, updated_at) VALUES
('55555555-5555-5555-5555-555555555555', 'João Silva', 'joao.cliente@teste.com', '$2a$10$Ia36tV1OMgVeW1mxZ4feMuMC8SSNZzkh7uvLNgh9n9/Xnw7TmBYWi', 'CUSTOMER', true, true, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Maria Souza', 'maria.cliente@teste.com', '$2a$10$Ia36tV1OMgVeW1mxZ4feMuMC8SSNZzkh7uvLNgh9n9/Xnw7TmBYWi', 'CUSTOMER', true, true, NOW(), NOW());

-- =============================================
-- 6. ENDEREÇOS DE TESTE
-- =============================================
INSERT INTO user_addresses (id, user_id, street, number, neighborhood, city, state, zip_code, complement, is_default, created_at, updated_at) VALUES
('ad111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP', '01010-000', 'Apto 42', true, NOW(), NOW()),
('ad222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Avenida Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', NULL, true, NOW(), NOW());

-- =============================================
-- 7. PEDIDOS DE TESTE
-- =============================================
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

-- =============================================
-- 8. CUPONS
-- =============================================
INSERT INTO coupons (id, code, type, value, start_date, end_date, active, created_at) VALUES
(gen_random_uuid(), 'BEMVINDO10', 'PERCENTAGE', 10.00, NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 year', true, NOW()),
(gen_random_uuid(), 'ARUANDA5', 'FIXED', 5.00, NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 year', true, NOW());

-- =============================================
-- 9. NEWSLETTER
-- =============================================
INSERT INTO newsletter_subscribers (id, email, active, subscribed_at) VALUES
(gen_random_uuid(), 'joao.cliente@teste.com', true, NOW()),
(gen_random_uuid(), 'maria.cliente@teste.com', true, NOW());

-- =============================================
-- 10. REVIEWS
-- =============================================
INSERT INTO reviews (id, user_id, product_id, rating, comment, status, created_at) VALUES
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 5, 'Vela excelente, queima muito bem!', 'APPROVED', NOW()),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222221', 4, 'Chapéu muito bonito e bem acabado.', 'APPROVED', NOW());

-- =============================================
-- 11. PLANO DE ASSINATURA
-- =============================================
INSERT INTO subscription_plans (id, type, name, description, base_price, active) VALUES
('00000000-0000-0000-0000-000000000001', 'FIXED', 'Plano Luz Diária', 'Receba velas de 7 dias todo mês em sua casa.', 50.00, true);

INSERT INTO subscriptions (id, user_id, plan_id, frequency, status, total_price, next_billing_at, created_at, plan_name) VALUES
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'MONTHLY', 'ACTIVE', 50.00, NOW() + INTERVAL '30 days', NOW(), 'Plano Luz Diária');

-- =============================================
-- 12. TEMPLATES DE EMAIL
-- =============================================
-- Configuração inicial de email
INSERT INTO email_configs (id, mail_host, mail_port, mail_sender_address, mail_sender_name)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'localhost',
    1025,
    'nao-responda@ateliedearuanda.com.br',
    'Ateliê Filhos de Aruanda'
);

-- Template: NEWSLETTER_CONFIRM
INSERT INTO email_templates (id, slug, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'newsletter-confirm', 'Confirmação de Newsletter',
'✨ Confirme sua inscrição - Ateliê Filhos de Aruanda',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Bem-vindo(a)!</h2>
    <p>Obrigado por se inscrever na nossa Newsletter. A partir de agora você receberá nossas novidades e cupons exclusivos.</p>
    <p>Até breve,</p>
    <p>Equipe Ateliê</p>
</div>',
'NEWSLETTER_CONFIRM', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'NEWSLETTER_CONFIRM');

-- Template: USER_VERIFY
INSERT INTO email_templates (id, slug, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'user-verify', 'Código de Verificação de Cadastro', 'Seu código de verificação: {{{code}}}',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Olá, {{{name}}}!</h2>
    <p>Use o código abaixo para verificar seu cadastro:</p>
    <h1 style="letter-spacing: 8px; text-align: center; color: #0f2A44;">{{{code}}}</h1>
    <p>O código expira em 15 minutos.</p>
</div>',
'USER_VERIFY', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'USER_VERIFY');

-- Template: PRODUCT_PRICE_DROP
INSERT INTO email_templates (id, slug, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'product-price-drop', 'Alerta de Baixa de Preço',
'O preço baixou! {{{product_name}}} com {{{discount_percentage}}}% de desconto',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #d4af37; text-align: center;">Uma oferta que você vai amar!</h2>
    <p>Olá, {{{customer_name}}}!</p>
    <p>O produto que você favoritou, <strong>{{{product_name}}}</strong>, acabou de baixar de preço!</p>
    <div style="text-align: center; margin-top: 30px;">
        <a href="{{{product_link}}}" style="background-color: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold;">APROVEITAR AGORA</a>
    </div>
</div>',
'PRODUCT_PRICE_DROP', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'PRODUCT_PRICE_DROP');
