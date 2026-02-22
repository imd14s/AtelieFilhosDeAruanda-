CREATE TABLE email_configs (
    id UUID PRIMARY KEY,
    mail_host VARCHAR(255) NOT NULL,
    mail_port INTEGER NOT NULL,
    mail_username VARCHAR(255),
    mail_password VARCHAR(255),
    mail_sender_address VARCHAR(255) NOT NULL,
    mail_sender_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração inicial baseada nos padrões anteriores (opcional, mas recomendado para evitar quebra imediata)
INSERT INTO email_configs (id, mail_host, mail_port, mail_sender_address, mail_sender_name)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'localhost',
    1025,
    'nao-responda@ateliedearuanda.com.br',
    'Ateliê Filhos de Aruanda'
);
