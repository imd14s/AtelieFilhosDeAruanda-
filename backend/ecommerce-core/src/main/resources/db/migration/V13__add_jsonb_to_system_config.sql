-- Adiciona JSONB ao system_config (Postgres). Em H2 test profile, Flyway está desligado.
ALTER TABLE system_config
  ADD COLUMN IF NOT EXISTS config_json JSONB;

-- Cria config agrupada do frete (modelo 2)
INSERT INTO system_config (config_key, config_value, config_json)
VALUES (
  'SHIPPING_RULES',
  '{}',
  '{
    "provider_mode": "J3",
    "j3": {
      "rate": 13.00,
      "free_threshold": 299.00,
      "cep_prefixes": ["010", "20040"]
    },
    "flat_rate": {
      "rate": 13.00,
      "free_threshold": 299.00
    }
  }'::jsonb
)
ON CONFLICT (config_key) DO UPDATE
SET config_json = EXCLUDED.config_json,
    updated_at = NOW();
