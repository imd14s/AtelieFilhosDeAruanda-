-- =============================================================================
-- V6__add_password_change_template.sql
-- Adiciona template padrão para notificação de troca de senha
-- =============================================================================

INSERT INTO email_templates (id, slug, name, subject, content, automation_type, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'PASSWORD_CHANGE',
    'Notificação de Alteração de Senha',
    'Segurança: Sua senha foi alterada com sucesso',
    'Olá {{{name}}},<br><br>Este é um aviso de segurança para informar que a senha da sua conta no Ateliê Filhos de Aruanda foi alterada recentemente.<br><br>Se foi você quem realizou esta alteração, não é necessário tomar nenhuma ação.<br><br><b>Caso você não tenha solicitado esta mudança, entre em contato imediatamente com nosso suporte.</b><br><br>Atenciosamente,<br>Equipe Ateliê Filhos de Aruanda',
    'PASSWORD_CHANGE',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
