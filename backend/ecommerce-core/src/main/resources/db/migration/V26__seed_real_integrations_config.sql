-- Configs para Remoção de Fundo (Ex: Remove.bg)
INSERT INTO system_config (config_key, config_value) VALUES
('AI_REMOVE_BG_ENABLED', 'false'),
('AI_REMOVE_BG_API_KEY', ''), -- Admin preenche no Dashboard
('AI_REMOVE_BG_URL', 'https://api.remove.bg/v1.0/removebg')
ON CONFLICT (config_key) DO NOTHING;

-- Configs para Mercado Livre (Outbound)
INSERT INTO system_config (config_key, config_value) VALUES
('ML_SYNC_ENABLED', 'false'),
('ML_APP_ID', ''),
('ML_USER_ID', ''), -- Necessário para postar no usuário certo
('ML_ACCESS_TOKEN', '') -- Admin preenche/renova no Dashboard
ON CONFLICT (config_key) DO NOTHING;
