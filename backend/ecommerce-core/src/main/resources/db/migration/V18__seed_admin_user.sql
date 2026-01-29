-- ATENÇÃO: Usuário Admin de Bootstrap.
-- Nasce INATIVO (active=false). Deve ser ativado manualmente via Banco de Dados
-- ou via procedure segura de reset de senha.
INSERT INTO users (id, name, email, password, role, active, created_at)
VALUES (
  gen_random_uuid(),
  'Admin Bootstrap',
  'admin@atelie.com',
  'DISABLED_ACCOUNT_CHANGE_PASSWORD', -- Hash inválida intencionalmente
  'ADMIN',
  false, -- Segurança: Inativo por padrão
  now()
)
ON CONFLICT (email) DO NOTHING;
