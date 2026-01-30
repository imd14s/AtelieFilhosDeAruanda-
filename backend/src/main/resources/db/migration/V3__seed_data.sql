-- ATENÇÃO: Usuário Admin agora é gerenciado pelo AdminBootstrap.java via variáveis de ambiente.

-- 1. System Configs Básicas
INSERT INTO system_config (config_key, config_value) VALUES
('CACHE_TTL_SECONDS', '300'),
('SHIPPING_PROVIDER_MODE', 'J3'),
('J3_RATE', '13.00'),
('J3_FREE_SHIPPING_THRESHOLD', '299.00'),
('J3_CEP_PREFIXES', ''),
('FLAT_RATE', '25.00'),
('FLAT_FREE_SHIPPING_THRESHOLD', '500.00'),
('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/test'),
('N8N_Automation_Enabled', 'false'),
('AI_ENABLED', 'false'),
('AI_API_URL', 'https://api.openai.com/v1/chat/completions'),
('AI_MODEL', 'gpt-4o-mini'),
('AI_PROMPT_TEMPLATE_DESC', 'Crie uma descrição para o produto {product} com contexto: {context}'),
('FISCAL_WEBHOOK_URL', ''),
('ML_SYNC_ENABLED', 'false')
ON CONFLICT (config_key) DO NOTHING;

-- 2. Providers (Drivers)
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled) VALUES
(gen_random_uuid(), 'SHIPPING', 'J3', 'J3 Transportadora', true, 10, 'shipping.j3', true),
(gen_random_uuid(), 'SHIPPING', 'FLAT', 'Frete Fixo', true, 90, 'shipping.flat_rate', false),
(gen_random_uuid(), 'SHIPPING', 'LOGGI_WEBHOOK', 'Loggi API', false, 20, 'universal.shipping.webhook', true),
(gen_random_uuid(), 'PAYMENT', 'MERCADO_PAGO', 'Mercado Pago', true, 10, 'payment.mercadopago', true),
(gen_random_uuid(), 'PAYMENT', 'PIX_BANK_WEBHOOK', 'Banco Pix', false, 20, 'universal.payment.webhook', false),
(gen_random_uuid(), 'NOTIFICATION', 'WHATSAPP', 'WhatsApp', false, 10, 'universal.notification.webhook', false)
ON CONFLICT (service_type, code) DO NOTHING;

-- 3. Provider Configs (JSONs)
-- J3
INSERT INTO service_provider_configs (id, provider_id, environment, config_json)
SELECT gen_random_uuid(), id, 'prod', '{ "rate": 14.50, "free_threshold": 299.00, "cep_prefixes": "010,011,012,200,220" }'
FROM service_providers WHERE code = 'J3' AND service_type = 'SHIPPING';

-- Mercado Pago
INSERT INTO service_provider_configs (id, provider_id, environment, config_json)
SELECT gen_random_uuid(), id, 'prod', '{ "public_key": "APP_USR-...", "access_token": "APP_USR-...", "sandbox": false }'
FROM service_providers WHERE code = 'MERCADO_PAGO' AND service_type = 'PAYMENT';

-- 4. Regras de Roteamento Padrão
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code, behavior_json) VALUES 
-- Regra 1: Frete Grátis J3 acima de 500
(gen_random_uuid(), 'SHIPPING', true, 10, '{ "expression": "#ctx.cartTotal >= 500" }', 'J3', '{ "timeout_ms": 2000 }'),
-- Regra 2: Default Frete Fixo
(gen_random_uuid(), 'SHIPPING', true, 999, '{ "expression": "true" }', 'FLAT', NULL),
-- Regra 3: Default Pagamento MP
(gen_random_uuid(), 'PAYMENT', true, 100, '{ "expression": "true" }', 'MERCADO_PAGO', NULL);

-- 5. Feature Flag inicial
INSERT INTO feature_flags (id, flag_key, enabled, value_json, updated_at) VALUES 
(gen_random_uuid(), 'MAINTENANCE_MODE', false, '{"reason": "Upgrade de sistema", "eta": "2h"}', NOW())
ON CONFLICT (flag_key) DO NOTHING;
