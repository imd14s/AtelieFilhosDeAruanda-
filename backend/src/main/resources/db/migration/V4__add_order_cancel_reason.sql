-- V4: Adiciona campo de motivo de cancelamento à tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(500);
