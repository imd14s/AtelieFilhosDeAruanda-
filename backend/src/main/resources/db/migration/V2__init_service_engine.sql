-- 2. Feature Flags (Mantido pois não existe no V1)
CREATE TABLE feature_flags (
    id          UUID PRIMARY KEY,
    flag_key    VARCHAR(100) NOT NULL UNIQUE,
    enabled     BOOLEAN DEFAULT false,
    value_json  TEXT,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- As tabelas system_config, service_providers, configs e routing_rules
-- foram movidas para V1__init_schema.sql para atender validação inicial do JPA.
