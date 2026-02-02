-- Aponta todos os provedores de webhook para o novo driver único
UPDATE service_providers 
SET driver_key = 'universal.webhook',
    updated_at = NOW()
WHERE driver_key IN (
    'universal.payment.webhook', 
    'universal.shipping.webhook', 
    'universal.notification.webhook'
);
