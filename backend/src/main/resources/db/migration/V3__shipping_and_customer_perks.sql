-- Adicionar ID do Cliente no Mercado Pago aos usuários
ALTER TABLE users ADD COLUMN mp_customer_id VARCHAR(100);

-- Criar tabela de múltiplos endereços
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    label VARCHAR(50) NOT NULL DEFAULT 'Principal', -- Ex: Casa, Trabalho
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

-- Adicionar dados de endereço fixos ao pedido para histórico
-- Isso garante que se o usuário mudar o endereço no perfil, o pedido antigo continua com o endereço correto da entrega.
ALTER TABLE orders 
ADD COLUMN shipping_street VARCHAR(255),
ADD COLUMN shipping_number VARCHAR(20),
ADD COLUMN shipping_complement VARCHAR(100),
ADD COLUMN shipping_neighborhood VARCHAR(100),
ADD COLUMN shipping_city VARCHAR(100),
ADD COLUMN shipping_state VARCHAR(2),
ADD COLUMN shipping_zip_code VARCHAR(10),
ADD COLUMN shipping_cost DECIMAL(19, 2),
ADD COLUMN shipping_provider VARCHAR(100);
