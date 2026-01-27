CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL, -- IN, OUT, RESERVED
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id VARCHAR(255), -- ID do pedido ou ajuste externo
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_inventory FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_inventory_product ON inventory_movements(product_id);
