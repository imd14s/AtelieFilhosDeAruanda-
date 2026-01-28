-- Adiciona coluna JSONB para guardar variáveis customizadas do produto
-- Exemplo de uso: { "material": "algodão", "peso": "200g", "personalizavel": true }
ALTER TABLE products ADD COLUMN attributes JSONB DEFAULT '{}';

-- Cria um índice para busca rápida dentro do JSON (Performance para Analytics)
-- Ex: Buscar todos os produtos onde attributes->>'cor' = 'azul'
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
