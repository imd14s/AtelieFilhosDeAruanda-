-- =============================================================================
-- V2__seed_data.sql
-- Dados iniciais (Seeds) do Ateliê Filhos de Aruanda
-- =============================================================================

-- 1. PROVEDORES DE SERVIÇO BASE
INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'PAYMENT', 'MERCADO_PAGO', 'Mercado Pago', true, 1, 'payment.mercadopago', false, NOW(), NOW()),
    ('33f1e000-0000-0000-0000-33f1e0000000', 'SHIPPING', 'J3_FLEX', 'J3 Flex', true, 5, 'shipping.j3flex', false, NOW(), NOW())
ON CONFLICT (service_type, code) DO NOTHING;

-- 2. CONFIGURAÇÕES DOS PROVEDORES
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version, active, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    'production',
    '{"cost": 15.00, "delivery_days": 3, "display_name": "J3 Flex"}',
    1,
    true,
    NOW()
FROM service_providers 
WHERE code = 'J3_FLEX'
ON CONFLICT DO NOTHING;

-- 3. CONFIGURAÇÕES DO SISTEMA
INSERT INTO system_config (config_key, config_value, config_json)
VALUES 
    ('DOCUMENT_RETENTION_DAYS', '30', '{"options": [30, 60, 90], "current": 30}')
ON CONFLICT (config_key) DO NOTHING;
