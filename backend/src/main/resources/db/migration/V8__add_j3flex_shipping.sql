-- =============================================================================
-- V8__add_j3flex_shipping.sql
-- Registro do motor de frete J3 Flex
-- =============================================================================

INSERT INTO service_providers (id, service_type, code, name, enabled, priority, driver_key, health_enabled, created_at, updated_at)
VALUES (
    '33f1e000-0000-0000-0000-33f1e0000000', 
    'SHIPPING', 
    'J3_FLEX', 
    'J3 Flex', 
    true, 
    5, 
    'shipping.j3flex', 
    false, 
    NOW(), 
    NOW()
) ON CONFLICT (service_type, code) DO UPDATE SET enabled = true, priority = 5;

-- Configuração inicial padrão para produção (o usuário poderá alterar no dashboard)
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
