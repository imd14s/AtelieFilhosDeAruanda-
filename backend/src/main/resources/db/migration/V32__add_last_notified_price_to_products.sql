ALTER TABLE products ADD COLUMN last_notified_price DECIMAL(19, 2);
UPDATE products SET last_notified_price = price;
