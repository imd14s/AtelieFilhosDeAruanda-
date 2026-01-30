-- 1. Configurações Dinâmicas
CREATE TABLE system_config (
  config_key VARCHAR(120) PRIMARY KEY,
  config_value TEXT NOT NULL,
  config_json JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_system_config_updated_at ON system_config(updated_at);

-- 2. Feature Flags
CREATE TABLE feature_flags (
    id          UUID PRIMARY KEY,
    flag_key    VARCHAR(100) NOT NULL UNIQUE,
    enabled     BOOLEAN DEFAULT false,
    value_json  TEXT,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Service Providers (Motor de Serviços)
CREATE TABLE service_providers (
    id             UUID PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    service_type   VARCHAR(50) NOT NULL,
    code           VARCHAR(50) NOT NULL,
    driver_key     VARCHAR(100) NOT NULL,
    priority       INTEGER NOT NULL DEFAULT 0,
    enabled        BOOLEAN DEFAULT true,
    health_enabled BOOLEAN DEFAULT false,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_service_provider_type_code UNIQUE (service_type, code)
);

CREATE TABLE service_provider_configs (
    id            UUID PRIMARY KEY,
    provider_id   UUID        NOT NULL,
    environment   VARCHAR(20) NOT NULL,
    config_json   TEXT        NOT NULL,
    secrets_ref   VARCHAR(200),
    version       INTEGER     NOT NULL DEFAULT 1,
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_provider_configs_provider FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);

CREATE TABLE service_routing_rules (
    id            UUID PRIMARY KEY,
    service_type  VARCHAR(50) NOT NULL,
    priority      INTEGER NOT NULL DEFAULT 0,
    enabled       BOOLEAN DEFAULT true,
    match_json    TEXT NOT NULL,
    provider_code VARCHAR(50) NOT NULL,
    behavior_json TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);