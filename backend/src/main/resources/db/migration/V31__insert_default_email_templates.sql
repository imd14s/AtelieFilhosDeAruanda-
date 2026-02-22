-- Inserção de Templates de E-mail Default para Automações Críticas
-- Isso garante que as automações não falharão por falta de template no banco inicial.

-- Template: NEWSLETTER_CONFIRM
INSERT INTO email_templates (id, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Bem-vindo(a) à Newsletter', 'Bem-vindo(a) à nossa Newsletter!',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Bem-vindo(a)!</h2>
    <p>Obrigado por se inscrever na nossa Newsletter. A partir de agora você receberá nossas novidades e cupons exclusivos.</p>
    <p>Até breve,</p>
    <p>Equipe Ateliê</p>
</div>',
'NEWSLETTER_CONFIRM', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'NEWSLETTER_CONFIRM');

-- Template: USER_VERIFY
INSERT INTO email_templates (id, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Código de Verificação de Cadastro', 'Seu código de verificação: {{{code}}}',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Olá, {{{name}}}!</h2>
    <p>Obrigado por se cadastrar na nossa loja. Para concluir, utilize o código abaixo na tela de verificação:</p>
    <h1 style="color: #d4af37; letter-spacing: 5px; text-align: center; padding: 10px; background: #fdfdfd; border: 1px dashed #ccc;">{{{code}}}</h1>
    <p>Caso não tenha solicitado, ignore este e-mail.</p>
</div>',
'USER_VERIFY', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'USER_VERIFY');

-- Template: ORDER_CONFIRM
INSERT INTO email_templates (id, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Confirmação do Pedido', 'Recebemos seu pedido #{{{order_number}}}',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Olá, {{{customer_name}}}!</h2>
    <p>Recebemos o seu pedido <strong>#{{{order_number}}}</strong> no valor de <strong>R$ {{{total}}}</strong>.</p>
    <p>Assim que o pagamento for confirmado, iniciaremos a separação e envio.</p>
    <p>Agradecemos a preferência!</p>
</div>',
'ORDER_CONFIRM', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'ORDER_CONFIRM');

-- Template: PASSWORD_RESET
INSERT INTO email_templates (id, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Recuperação de Senha', 'Recupere sua senha do Ateliê',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2>Olá, {{{name}}}!</h2>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href="{{{reset_link}}}" style="background-color: #333; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Minha Senha</a>
    </p>
    <p>Ou copie e cole o link no seu navegador: {{{reset_link}}}</p>
    <p>Se você não fez essa solicitação, pode apenas ignorar este e-mail.</p>
</div>',
'PASSWORD_RESET', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'PASSWORD_RESET');
