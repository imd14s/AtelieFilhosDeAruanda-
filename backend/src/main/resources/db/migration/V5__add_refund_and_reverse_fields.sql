-- V5: Adiciona campos para integração financeira (Estorno) e Logística Reversa
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_external_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reverse_tracking_code VARCHAR(100);
