-- Altera colunas JSONB para TEXT para suportar dados criptografados (blobs)
ALTER TABLE marketplace_integrations ALTER COLUMN encrypted_credentials TYPE TEXT;
ALTER TABLE marketplace_integrations ALTER COLUMN auth_payload TYPE TEXT;
