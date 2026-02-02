-- 1. System Configs Básicas (Valores de Fallback removidos para segurança)
INSERT INTO system_config (config_key, config_value) VALUES
('CACHE_TTL_SECONDS', '300'),
('SHIPPING_PROVIDER_MODE', 'J3'),
('J3_RATE', '0.00'),
('J3_FREE_SHIPPING_THRESHOLD', '0.00'),
('J3_CEP_PREFIXES', ''),
('FLAT_RATE', '0.00'),
('FLAT_FREE_SHIPPING_THRESHOLD', '0.00'),
('N8N_WEBHOOK_URL', 'CONFIGURAR_NO_DASHBOARD'),
('N8N_Automation_Enabled', 'false'),
('AI_ENABLED', 'false'),
('AI_API_URL', 'CONFIGURAR_NO_DASHBOARD'),
('AI_MODEL', 'gpt-4o-mini'),
('AI_PROMPT_TEMPLATE_DESC', 'Crie uma descrição para o produto {product} com contexto: {context}'),
('FISCAL_WEBHOOK_URL', 'CONFIGURAR_NO_DASHBOARD'),
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

-- 4. Regras de Roteamento Padrão
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code, behavior_json) VALUES 
(gen_random_uuid(), 'SHIPPING', true, 10, '{ "expression": "#ctx.cartTotal >= 500" }', 'J3', '{ "timeout_ms": 2000 }'),
(gen_random_uuid(), 'SHIPPING', true, 999, '{ "expression": "true" }', 'FLAT', NULL),
(gen_random_uuid(), 'PAYMENT', true, 100, '{ "expression": "true" }', 'MERCADO_PAGO', NULL);
