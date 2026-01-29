-- Configurações padrão para automação N8n (Evita crash na inicialização)
INSERT INTO system_config (config_key, config_value)
VALUES
  ('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/test'),
  ('N8N_Automation_Enabled', 'false') -- Desativado por padrão para segurança
ON CONFLICT (config_key) DO NOTHING;
