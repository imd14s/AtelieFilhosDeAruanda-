-- TTL do cache em memória (segundos) - mutável via dashboard
INSERT INTO system_config (config_key, config_value)
VALUES ('CACHE_TTL_SECONDS', '300')
ON CONFLICT (config_key) DO NOTHING;
