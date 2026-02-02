-- 1. Categoria Padrão (Sem Pai)
INSERT INTO categories (id, name, active) VALUES
(gen_random_uuid(), 'Geral', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Providers (Drivers)
-- CORREÇÃO: Adicionamos created_at e updated_at
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at) VALUES
(gen_random_uuid(), 'SHIPPING', 'J3', 'J3 Transportadora', true, 10, 'shipping.j3', true, NOW(), NOW()),
(gen_random_uuid(), 'SHIPPING', 'FLAT', 'Frete Fixo', true, 90, 'shipping.flat_rate', false, NOW(), NOW()),
(gen_random_uuid(), 'SHIPPING', 'LOGGI_WEBHOOK', 'Loggi API', false, 20, 'universal.shipping.webhook', true, NOW(), NOW()),
(gen_random_uuid(), 'PAYMENT', 'MERCADO_PAGO', 'Mercado Pago', true, 10, 'payment.mercadopago', true, NOW(), NOW()),
(gen_random_uuid(), 'PAYMENT', 'PIX_BANK_WEBHOOK', 'Banco Pix', false, 20, 'universal.payment.webhook', false, NOW(), NOW()),
(gen_random_uuid(), 'NOTIFICATION', 'WHATSAPP', 'WhatsApp', false, 10, 'universal.notification.webhook', false, NOW(), NOW())
ON CONFLICT (service_type, code) DO NOTHING;

-- 3. Configs Padrão para Providers (Exemplo)
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
