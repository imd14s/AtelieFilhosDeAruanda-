-- Migração V2 para adicionar dimensões de frete aos produtos
ALTER TABLE products ADD COLUMN weight DECIMAL(10,3);
ALTER TABLE products ADD COLUMN height DECIMAL(10,2);
ALTER TABLE products ADD COLUMN width DECIMAL(10,2);
ALTER TABLE products ADD COLUMN length DECIMAL(10,2);

COMMENT ON COLUMN products.weight IS 'Peso em kg';
COMMENT ON COLUMN products.height IS 'Altura em cm';
COMMENT ON COLUMN products.width IS 'Largura em cm';
COMMENT ON COLUMN products.length IS 'Comprimento em cm';
