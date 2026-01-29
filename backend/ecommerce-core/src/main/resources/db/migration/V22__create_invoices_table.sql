CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    external_invoice_id VARCHAR(100), -- ID no Bling/Gov
    status VARCHAR(50) NOT NULL,      -- EMITTED, ERROR, CANCELED
    xml_url VARCHAR(500),
    pdf_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_invoices_order ON invoices(order_id);
