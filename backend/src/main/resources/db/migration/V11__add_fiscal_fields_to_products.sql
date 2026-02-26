-- Migração para adicionar campos fiscais à tabela de produtos
-- Passo 2 de 5 da implementação de dados fiscais

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ncm VARCHAR(20),
ADD COLUMN IF NOT EXISTS production_type VARCHAR(50) DEFAULT 'REVENDA',
ADD COLUMN IF NOT EXISTS origin VARCHAR(50) DEFAULT 'NACIONAL';

-- Comentários para documentação no banco de dados
COMMENT ON COLUMN products.ncm IS 'Nomenclatura Comum do Mercosul';
COMMENT ON COLUMN products.production_type IS 'Tipo de produção: PROPRIA ou REVENDA';
COMMENT ON COLUMN products.origin IS 'Origem da mercadoria (Tabela A SEFAZ): NACIONAL, etc';
