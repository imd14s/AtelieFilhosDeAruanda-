-- Configurações de IA (Inicialmente vazias ou desativadas)
INSERT INTO system_config (config_key, config_value) VALUES
('AI_ENABLED', 'false'),
('AI_API_URL', 'https://api.openai.com/v1/chat/completions'),
('AI_API_KEY', ''), -- Admin deve preencher
('AI_MODEL', 'gpt-4o-mini'),
('AI_PROMPT_TEMPLATE_DESC', 'Crie uma descrição para o produto {product} com contexto: {context}')
ON CONFLICT (config_key) DO NOTHING;

-- Configurações Fiscal
INSERT INTO system_config (config_key, config_value) VALUES
('FISCAL_WEBHOOK_URL', '') -- Admin deve colocar a URL do n8n/Bling aqui
ON CONFLICT (config_key) DO NOTHING;
