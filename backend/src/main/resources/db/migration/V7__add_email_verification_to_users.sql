-- Adiciona colunas para verificação de e-mail na tabela de usuários
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(100);

-- Sincroniza quem já era ADMIN para nascer verificado
UPDATE users SET email_verified = TRUE WHERE role = 'ADMIN';
