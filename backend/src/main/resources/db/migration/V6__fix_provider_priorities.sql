-- =============================================================================
-- V6__fix_provider_priorities.sql
-- Ajuste de prioridades e desativação de provedores sem configuração
-- =============================================================================

-- Desativar Melhor Envio (exige token que não temos em dev)
UPDATE service_providers 
SET enabled = false, priority = 10 
WHERE code = 'MELHOR_ENVIO' AND service_type = 'SHIPPING';

-- Garantir que o Frete Padrão está habilitado e com prioridade máxima
UPDATE service_providers 
SET enabled = true, priority = 1 
WHERE code = 'STANDARD' AND service_type = 'SHIPPING';

-- Garantir que o Frete Padrão tem uma configuração válida
INSERT INTO service_provider_configs (id, provider_id, environment, config_json, version, active, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    'dev',
    '{"rate": 15.00, "free_threshold": 999.00, "display_name": "Frete Grátis (Teste)"}',
    1,
    true,
    NOW()
FROM service_providers 
WHERE code = 'STANDARD' AND service_type = 'SHIPPING'
ON CONFLICT DO NOTHING;
