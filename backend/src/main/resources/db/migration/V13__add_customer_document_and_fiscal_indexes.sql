-- Migration V13: Suporte Fiscal (NF-e) em Pedidos e Otimização de Auditoria
-- Escopo: Adição estrutural e indexação base para emissão e consulta fiscal

-- Documento do Destinatário no Pedido
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_document VARCHAR(20);
COMMENT ON COLUMN orders.customer_document IS 'CPF/CNPJ do destinatário para validação de faturamento/NF-e';

-- Índices Estratégicos (Performance)
CREATE INDEX IF NOT EXISTS idx_products_ncm ON products(ncm);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin);
CREATE INDEX IF NOT EXISTS idx_orders_customer_doc ON orders(customer_document);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
