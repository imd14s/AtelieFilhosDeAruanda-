-- Adiciona a coluna que faltava na tabela de itens do pedido
ALTER TABLE order_items 
ADD COLUMN total_price NUMERIC(38, 2) NOT NULL DEFAULT 0;
