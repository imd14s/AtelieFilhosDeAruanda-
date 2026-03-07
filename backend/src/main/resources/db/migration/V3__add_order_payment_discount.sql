-- V3: Adiciona campos de método de pagamento e desconto à tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(19, 2) DEFAULT 0.00;
