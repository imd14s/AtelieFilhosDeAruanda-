CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  price NUMERIC(19,2) NOT NULL,
  category_id UUID NOT NULL,
  active BOOLEAN NOT NULL,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
