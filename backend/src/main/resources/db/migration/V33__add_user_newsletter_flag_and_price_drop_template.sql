-- Adição de campo de newsletter no usuário e template de baixa de preço
ALTER TABLE users ADD COLUMN subscribed_newsletter BOOLEAN DEFAULT FALSE;

-- Template: PRODUCT_PRICE_DROP
INSERT INTO email_templates (id, slug, name, subject, content, automation_type, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'product-price-drop', 'Alerta de Baixa de Preço', 'O preço baixou! {{{product_name}}} com {{{discount_percentage}}}% de desconto',
'<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #d4af37; text-align: center;">Uma oferta que você vai amar!</h2>
    <p>Olá, {{{customer_name}}}!</p>
    <p>O produto que você favoritou, <strong>{{{product_name}}}</strong>, acabou de baixar de preço!</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <img src="{{{product_image}}}" alt="{{{product_name}}}" style="max-width: 200px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #333;">{{{product_name}}}</h3>
        <p style="text-decoration: line-through; color: #999; margin: 10px 0 5px 0;">De: R$ {{{old_price}}}</p>
        <p style="font-size: 24px; color: #e53e3e; font-weight: bold; margin: 0;">Por: R$ {{{new_price}}}</p>
        <p style="color: #38a169; font-weight: bold;">(Desconto de {{{discount_percentage}}}%)</p>
    </div>

    <p style="font-size: 14px; color: #666;">{{{product_description}}}</p>

    <div style="text-align: center; margin-top: 30px;">
        <a href="{{{product_link}}}" style="background-color: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">APROVEITAR AGORA</a>
    </div>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">Você recebeu este e-mail porque favoritou este produto em nossa loja. Se não desejar mais receber esses alertas, ajuste suas preferências na sua conta.</p>
</div>',
'PRODUCT_PRICE_DROP', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE automation_type = 'PRODUCT_PRICE_DROP');

-- Garantir que a fila de e-mail tenha suporte para prioridade se não houver (já existe o enum no Java, garantindo no DB)
-- A coluna priority já deve existir pois EmailQueue.java a referencia.
