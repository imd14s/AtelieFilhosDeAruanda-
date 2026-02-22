CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    signature_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Inserindo template inicial para confirmação de newsletter
INSERT INTO email_templates (id, slug, name, subject, content, is_active, created_at)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
    'NEWSLETTER_CONFIRMATION',
    'Confirmação de Newsletter',
    '✨ Confirme sua inscrição - Ateliê Filhos de Aruanda',
    '<p>Olá!</p><p>Obrigado por se inscrever em nossa newsletter. Clique no botão abaixo para confirmar sua inscrição e começar a receber nossas novidades e ofertas exclusivas!</p><p style="text-align: center;"><a href="{{verification_link}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Confirmar Inscrição</a></p><p>Se você não solicitou esta inscrição, ignore este e-mail.</p>',
    TRUE,
    CURRENT_TIMESTAMP
);
