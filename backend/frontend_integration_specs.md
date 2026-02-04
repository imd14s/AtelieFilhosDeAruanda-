# Integração Frontend > Backend: Módulos de Loja

Este arquivo documenta as expectativas do Frontend em relação à API para os novos módulos de **Frete** e **Pagamento**.

## 1. Módulo de Frete (Shipping)

O frontend espera que o backend gerencie "Provedores de Frete" instalados/configurados por loja.

### Modelagem de Dados
```json
{
  "id": "uuid",
  "name": "CORREIOS", // ou "MELHOR_ENVIO", "FIXED"
  "enabled": true,
  "config": {
    "cepOrigem": "01001-000",
    "codServico": "04014" 
  },
  "rules": {
    "minWeight": 100, // gramas
    "freeShippingAbove": 200.00 // valor em reais
  }
}
```

### Endpoints Esperados

- **GET /api/settings/shipping**
    - Retorna lista de todos os provedores disponíveis/configurados para o Tenant atual.
    - Header Obrigatório: `X-Tenant-ID`

- **PUT /api/settings/shipping/{id}**
    - Atualiza configurações de um provedor.
    - Payload: Objeto `ShippingProvider` (parcial).

- **PATCH /api/settings/shipping/{id}/toggle**
    - Ativa/Desativa rapidamente.
    - Payload: `{ "enabled": true/false }`

---

## 2. Módulo de Pagamento (Payment)

Gerenciamento de gateways e métodos de pagamento.

### Modelagem de Dados
```json
{
  "id": "uuid",
  "name": "MERCADO_PAGO", // ou "STRIPE", "PIX"
  "enabled": false,
  "config": {
    "publicKey": "pk_test_...",
    "accessToken": "access_token_..."
  },
  "installments": {
    "max": 12,
    "interestFree": 3
  }
}
```

### Endpoints Esperados

- **GET /api/settings/payment**
    - Retorna lista de provedores.
    - Proteção: Dados sensíveis (Secret Keys) devem vir mascarados ou criptografados se possível, ou o frontend deve apenas enviar e não ler de volta.

- **PUT /api/settings/payment/{id}**
    - Atualiza credenciais.
    
- **PATCH /api/settings/payment/{id}/toggle**
    - Ativa/Desativa o método no checkout.

---

## 3. Observações Gerais
- Todas as requisições enviadas pelo Dashboard Admin incluem o header `Authorization: Bearer <jwt>`.
- O Backend deve validar se o usuário tem permissão `SETTINGS_WRITE` para alterar estes dados.
- Erros de validação (ex: credencial inválida) devem retornar `400 Bad Request` com mensagem clara.

---

## 4. Módulo Loja (Storefront) - NECESSIDADES DETECTADAS

O Frontend da loja identificou os seguintes pontos que podem não estar cobertos pelos endpoints de administração acima:

### Endpoints de Checkout
- **POST /api/checkout/calculate-shipping**
    - Necessário para calcular o frete no carrinho/checkout sem criar o pedido.
    - Payload: `{ "cep": "...", "items": [{ "id": "...", "quantity": 1 }] }`
    - Response: `[{ "provider": "CORREIOS", "price": 25.00, "days": 5 }]`

- **POST /api/checkout/process**
    - Processar o pagamento e criar o pedido final.
    - Payload: Dados do cliente, itens, método de pagamento escolhido.
    
### Endpoints de Produtos (Público)
- Confirmar se `GET /api/products` suporta filtro por `slug` além de `categoryId`. O frontend atual usa `id` temporariamente para detalhes.
