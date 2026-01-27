CREATE TABLE orders (
    id UUID PRIMARY KEY,
    status VARCHAR(20) NOT NULL, -- PENDING, PAID, SHIPPED, CANCELED
    source VARCHAR(50) NOT NULL, -- INTERNAL, MERCADO_LIVRE, TIKTOK
    external_id VARCHAR(255),    -- ID na loja externa
    customer_name VARCHAR(255),
    total_amount DECIMAL(19, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_orders_external ON orders(external_id);
