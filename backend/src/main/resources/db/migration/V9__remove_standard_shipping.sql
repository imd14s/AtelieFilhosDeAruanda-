-- =============================================================================
-- V9__remove_standard_shipping.sql
-- Remoção do antigo motor de "Frete Padrão" (STANDARD)
-- =============================================================================

-- Remover configurações associadas primeiro devido a restrições de chave estrangeira
DELETE FROM service_provider_configs 
WHERE provider_id IN (SELECT id FROM service_providers WHERE code = 'STANDARD');

-- Remover o provedor de serviço
DELETE FROM service_providers 
WHERE code = 'STANDARD' AND service_type = 'SHIPPING';
