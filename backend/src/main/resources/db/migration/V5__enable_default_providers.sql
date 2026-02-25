-- =============================================================================
-- V5__enable_default_providers.sql
-- Ativação dos provedores base para evitar erros no Checkout
-- =============================================================================

-- Inserir Provedor de Pagamento: Mercado Pago
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    'PAYMENT', 
    'MERCADO_PAGO', 
    'Mercado Pago', 
    true, 
    1, 
    'payment.mercadopago', 
    false, 
    NOW(), 
    NOW()
) ON CONFLICT (service_type, code) DO UPDATE SET enabled = true;

-- Inserir Provedor de Frete: Melhor Envio (Desativado para não bloquear o checkout sem token)
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    'SHIPPING', 
    'MELHOR_ENVIO', 
    'Melhor Envio', 
    false, 
    10, 
    'shipping.melhorenvio', 
    false, 
    NOW(), 
    NOW()
) ON CONFLICT (service_type, code) DO UPDATE SET enabled = false, priority = 10;

-- Adicionar Standard Shipping como fallback
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES (
    'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 
    'SHIPPING', 
    'STANDARD', 
    'Frete Padrão', 
    true, 
    1, 
    'shipping.standard', 
    false, 
    NOW(), 
    NOW()
) ON CONFLICT (service_type, code) DO UPDATE SET enabled = true, priority = 1;

-- Inserir Configuração Padrão para o Frete Standard (para evitar DRIVER_EXECUTION_FAILED)
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version, active, updated_at)
VALUES (
    gen_random_uuid(),
    'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
    'dev',
    '{"rate": 0.00, "free_threshold": 999.00, "display_name": "Frete Grátis (Teste)"}',
    1,
    true,
    NOW()
) ON CONFLICT DO NOTHING;
