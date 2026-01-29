-- ============================================================================
-- SEED: Inicialização do Motor de Serviços (Tornando o sistema funcional no Dia 1)
-- ============================================================================

-- 1. Registrar os DRIVERS Java no Banco de Dados (Service Providers)
-- Estes códigos (code) ligam o Dashboard às classes Java (driver_key)

INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled) VALUES
-- Frete
(gen_random_uuid(), 'SHIPPING', 'J3', 'J3 Transportadora', true, 10, 'shipping.j3', true),
(gen_random_uuid(), 'SHIPPING', 'FLAT', 'Frete Fixo', true, 90, 'shipping.flat_rate', false),
(gen_random_uuid(), 'SHIPPING', 'LOGGI_WEBHOOK', 'Loggi (Via API)', false, 20, 'universal.shipping.webhook', true),

-- Pagamento
(gen_random_uuid(), 'PAYMENT', 'MERCADO_PAGO', 'Mercado Pago', true, 10, 'payment.mercadopago', true),
(gen_random_uuid(), 'PAYMENT', 'PIX_BANK_WEBHOOK', 'Banco Pix (Webhook)', false, 20, 'universal.payment.webhook', false),

-- Notificação
(gen_random_uuid(), 'NOTIFICATION', 'WHATSAPP', 'WhatsApp (Twilio/Z-API)', false, 10, 'universal.notification.webhook', false)
ON CONFLICT (service_type, code) DO NOTHING;


-- 2. Configurações Iniciais (JSONs que o Dashboard edita)

-- Config do J3
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version)
SELECT gen_random_uuid(), id, 'prod', '{
  "rate": 14.50,
  "free_threshold": 299.00,
  "cep_prefixes": "010,011,012,200,220"
}', 1
FROM service_providers WHERE code = 'J3' AND service_type = 'SHIPPING';

-- Config do Frete Fixo
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version)
SELECT gen_random_uuid(), id, 'prod', '{
  "rate": 25.00,
  "free_threshold": 500.00
}', 1
FROM service_providers WHERE code = 'FLAT' AND service_type = 'SHIPPING';

-- Config do Mercado Pago
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version)
SELECT gen_random_uuid(), id, 'prod', '{
  "public_key": "APP_USR-...",
  "access_token": "APP_USR-...",
  "sandbox": false
}', 1
FROM service_providers WHERE code = 'MERCADO_PAGO' AND service_type = 'PAYMENT';


-- 3. Regras de Roteamento (O Cérebro da Escolha)

-- Regra 1: Se o carrinho > R$ 500,00, Tenta J3 (Frete Grátis configurado nele)
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code, behavior_json)
VALUES (
  gen_random_uuid(), 
  'SHIPPING', 
  true, 
  10, 
  '{ "expression": "#ctx.cartTotal >= 500" }', 
  'J3', 
  '{ "timeout_ms": 2000 }'
);

-- Regra 2: Fallback padrão para J3 em SP (prefixo 01)
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code)
VALUES (
  gen_random_uuid(), 
  'SHIPPING', 
  true, 
  50, 
  '{ "cep_prefix": ["01", "02", "03", "04", "05"] }', 
  'J3'
);

-- Regra 3: Default geral (Frete Fixo) para o resto do Brasil
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code)
VALUES (
  gen_random_uuid(), 
  'SHIPPING', 
  true, 
  999, 
  '{ "expression": "true" }', 
  'FLAT'
);

-- Regra 4: Pagamento Padrão = Mercado Pago
INSERT INTO service_routing_rules (id, service_type, enabled, priority, match_json, provider_code)
VALUES (
  gen_random_uuid(), 
  'PAYMENT', 
  true, 
  100, 
  '{ "expression": "true" }', 
  'MERCADO_PAGO'
);
