-- 1. Cria a tabela de variantes
CREATE TABLE product_variants (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL,
    gtin VARCHAR(14), -- EAN/UPC
    price NUMERIC(19, 2), -- Preço específico da variante (se null, usa do pai)
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes_json JSONB, -- { "cor": "azul", "tamanho": "M" }
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uk_variants_sku UNIQUE (sku)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_gtin ON product_variants(gtin);

-- 2. Migração de Dados: Cria uma variante "Default" para cada produto existente
-- Isso garante que o estoque atual não se perca.
INSERT INTO product_variants (id, product_id, sku, stock_quantity, price, active, attributes_json)
SELECT 
  gen_random_uuid(), 
  id, 
  'SKU-' || substring(id::text, 1, 8), -- Gera um SKU provisório
  stock_quantity, 
  price, 
  active,
  '{"default": true}'::jsonb
FROM products;

-- 3. Atualizar tabela de movimentos de estoque para apontar para variante
ALTER TABLE inventory_movements ADD COLUMN variant_id UUID;
ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);

-- 4. Atualizar itens do pedido para apontar para variante
ALTER TABLE order_items ADD COLUMN variant_id UUID;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
