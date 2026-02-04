# Integração Frontend > Backend: Módulo Marketing

Especificações para **Cupons** e **Recuperação de Carrinho**.

## 1. Cupons de Desconto

### Endpoints
- **GET /api/marketing/coupons**
    - Retorna lista de todos os cupons do Tenant.

- **POST /api/marketing/coupons**
    - Payload:
    ```json
    {
      "code": "VERAO23",
      "type": "PERCENTAGE", // ou FIXED
      "value": 15.00,
      "startDate": "2023-12-01T00:00:00Z",
      "endDate": "2023-12-31T23:59:59Z",
      "usageLimit": 100
    }
    ```

- **PATCH /api/marketing/coupons/{id}**
    - Payload: `{ "active": boolean }`
    - Para ativar/pausar campanhas rapidamente.

- **DELETE /api/marketing/coupons/{id}**
    - Soft delete recomendado.

## 2. Recuperação de Carrinho (Abandoned Cart)

Este módulo configura o "Worker" que envia e-mails para carrinhos abandonados.

### Endpoints
- **GET /api/marketing/abandoned-carts**
    - Retorna a configuração atual.

- **PUT /api/marketing/abandoned-carts**
    - Payload:
    ```json
    {
      "enabled": true,
      "triggers": [
         {
           "delayMinutes": 60,
           "subject": "Você esqueceu algo!",
           "templateId": "tmpl_recovery_1"
         },
         {
           "delayMinutes": 1440, // 24h
           "subject": "Última chance: 5% OFF",
           "templateId": "tmpl_recovery_2"
         }
      ]
    }
    ```

### Comportamento Esperado
- O Backend deve ter um Scheduler que verifica carrinhos abertos > tempo configurado e dispara o e-mail se o cliente tiver opt-in.
