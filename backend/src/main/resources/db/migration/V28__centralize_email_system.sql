ALTER TABLE email_templates 
ADD COLUMN automation_type VARCHAR(50),
ADD COLUMN automation_description TEXT;

-- Popular automações existentes se possível
UPDATE email_templates SET automation_type = 'NEWSLETTER_CONFIRM', automation_description = 'Confirmação de inscrição na newsletter.' WHERE slug = 'NEWSLETTER_CONFIRMATION';
UPDATE email_templates SET automation_type = 'USER_VERIFY', automation_description = 'Verificação de conta de novo usuário.' WHERE slug = 'VERIFICATION';
