-- Núcleo universal para serviços controlados por dashboard:
-- providers (shipping/payment/etc), configs por ambiente, regras de roteamento e feature flags.

CREATE TABLE IF NOT EXISTS service_providers (
  id            UUID PRIMARY KEY,
  service_type  VARCHAR(40)  NOT NULL,
  code          VARCHAR(80)  NOT NULL,
  name          VARCHAR(160) NOT NULL,
  enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
  priority      INTEGER      NOT NULL DEFAULT 100,
  driver_key    VARCHAR(160) NOT NULL,
  health_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_service_providers_type_code
  ON service_providers(service_type, code);

CREATE INDEX IF NOT EXISTS ix_service_providers_type_enabled_priority
  ON service_providers(service_type, enabled, priority);


CREATE TABLE IF NOT EXISTS service_provider_configs (
  id           UUID PRIMARY KEY,
  provider_id  UUID        NOT NULL,
  environment  VARCHAR(20) NOT NULL,  -- dev/test/prod
  config_json  CLOB        NOT NULL,
  secrets_ref  VARCHAR(200),
  version      INTEGER     NOT NULL DEFAULT 1,
  updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_provider_configs_provider
    FOREIGN KEY (provider_id) REFERENCES service_providers(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_provider_configs_provider_env
  ON service_provider_configs(provider_id, environment);


CREATE TABLE IF NOT EXISTS service_routing_rules (
  id            UUID PRIMARY KEY,
  service_type   VARCHAR(40) NOT NULL,
  enabled        BOOLEAN     NOT NULL DEFAULT TRUE,
  priority       INTEGER     NOT NULL DEFAULT 100,
  match_json     CLOB        NOT NULL,   -- critérios de match
  provider_code  VARCHAR(80) NOT NULL,   -- alvo
  behavior_json  CLOB,                  -- timeout, fallback, etc
  updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_routing_rules_type_enabled_priority
  ON service_routing_rules(service_type, enabled, priority);


CREATE TABLE IF NOT EXISTS feature_flags (
  id          UUID PRIMARY KEY,
  flag_key    VARCHAR(140) NOT NULL,
  enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
  value_json  CLOB,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_feature_flags_key
  ON feature_flags(flag_key);
