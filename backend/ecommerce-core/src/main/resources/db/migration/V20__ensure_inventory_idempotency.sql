-- Garante que um mesmo pedido (reference_id) não possa baixar estoque (OUT) do mesmo produto duas vezes.
-- Isso blinda o sistema contra cliques duplos, retentativas de fila e race conditions.

CREATE UNIQUE INDEX IF NOT EXISTS ux_inventory_idempotency 
ON inventory_movements (product_id, type, reference_id)
WHERE reference_id IS NOT NULL;
