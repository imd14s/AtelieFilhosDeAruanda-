-- Criar tabela de catálogo NCM
-- Passo 3 de 5 da implementação de dados fiscais

CREATE TABLE ncm_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para otimização de busca
CREATE INDEX idx_ncm_catalog_code ON ncm_catalog(code);
CREATE INDEX idx_ncm_catalog_description_trgm ON ncm_catalog USING gin (description gin_trgm_ops);

-- Adicionar alguns dados de exemplo (Seed básico)
INSERT INTO ncm_catalog (code, description) VALUES 
('6109.10.00', 'Camisetas de malha de algodão'),
('6203.42.00', 'Calças de algodão de uso masculino'),
('6403.99.90', 'Calçados de couro'),
('0000.00.00', 'NCM Genérico para Testes')
ON CONFLICT (code) DO NOTHING;
