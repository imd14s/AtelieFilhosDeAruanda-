-- 1. Drops the wrong index (which blocked multiple variants of the same product in the same order)
DROP INDEX IF EXISTS ux_inventory_idempotency;

-- 2. Creates the correct index based on VARIANT_ID
-- This ensures that the uniqueness check is applied per SKU, not per Product Parent
CREATE UNIQUE INDEX IF NOT EXISTS ux_inventory_idempotency 
ON inventory_movements (variant_id, type, reference_id)
WHERE reference_id IS NOT NULL;