-- V14__create_app_settings.sql
-- Tabela usada por N8nService (setting_key/setting_value)
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   VARCHAR(255) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
