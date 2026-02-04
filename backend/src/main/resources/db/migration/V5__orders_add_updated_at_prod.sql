-- MySQL/MariaDB: updated_at com auto-update
ALTER TABLE orders
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Backfill (se necessário)
UPDATE orders
SET updated_at = created_at
WHERE updated_at IS NULL;
