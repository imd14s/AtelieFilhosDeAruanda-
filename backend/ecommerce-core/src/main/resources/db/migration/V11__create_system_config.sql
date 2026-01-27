CREATE TABLE IF NOT EXISTS system_config (
  config_key VARCHAR(120) PRIMARY KEY,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_config_updated_at ON system_config(updated_at);
