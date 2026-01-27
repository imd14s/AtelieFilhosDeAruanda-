CREATE TABLE app_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

-- Inserir a configuração padrão (Desativada por segurança inicial)
INSERT INTO app_settings (setting_key, setting_value, description) 
VALUES ('ENABLE_LOW_STOCK_N8N', 'false', 'Ativa o disparo de webhook para n8n quando estoque estiver baixo');