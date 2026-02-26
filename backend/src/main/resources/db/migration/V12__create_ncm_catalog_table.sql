-- Criar tabela de catálogo NCM
-- Passo 4 de 5 da implementação de dados fiscais
-- Ajustado: 'code' como Chave Primária conforme diretrizes técnicas

CREATE TABLE ncm_catalog (
    code VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para otimização de busca por texto parcial
CREATE INDEX idx_ncm_catalog_description ON ncm_catalog(description);

-- Habilitar extensão pg_trgm para buscas textuais performáticas (se permitível no ambiente)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_ncm_catalog_description_trgm ON ncm_catalog USING gin (description gin_trgm_ops);

-- Seed básico de NCMs para validação
INSERT INTO ncm_catalog (code, description) VALUES 
('6109.10.00', 'Camisetas de malha de algodão'),
('6203.42.00', 'Calças de algodão de uso masculino'),
('6403.99.90', 'Calçados de couro'),
('0000.00.00', 'NCM Genérico para Testes')
ON CONFLICT (code) DO NOTHING;
