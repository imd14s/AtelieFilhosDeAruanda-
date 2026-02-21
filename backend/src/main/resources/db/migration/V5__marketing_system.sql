-- Migração para o novo sistema de Marketing e Assinaturas

-- 1. Assinaturas de E-mail
CREATE TABLE email_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    role VARCHAR(255),
    store_name VARCHAR(255),
    whatsapp VARCHAR(255),
    email VARCHAR(255),
    store_url VARCHAR(255),
    logo_url TEXT,
    motto TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Campanhas de E-mail
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    audience VARCHAR(50),
    signature_id UUID,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign_signature FOREIGN KEY (signature_id) REFERENCES email_signatures(id) ON DELETE SET NULL
);

-- 3. Atualização da Fila de E-mail para vincular a campanhas
ALTER TABLE email_queue ADD COLUMN campaign_id UUID;
ALTER TABLE email_queue ADD CONSTRAINT fk_queue_campaign FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE;
