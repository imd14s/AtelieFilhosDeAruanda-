# Mapa da API — Rotas e Exemplos de Requisição

**Última atualização:** 2026-02-04  
**Objetivo:** Referência de todas as rotas da API, com exemplos de solicitação e explicações.

---

## Como usar este documento

- **Base URL:** Suponha `http://localhost:8080` em desenvolvimento. Em produção, use a URL do servidor.
- **Autenticação:** A maioria das rotas exige header `Authorization: Bearer <JWT>`. Rotas públicas estão indicadas.
- **Content-Type:** Para corpo JSON use `Content-Type: application/json`. Para upload use `multipart/form-data`.
- **Códigos comuns:** `200` OK, `201` Created, `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found.

---

## Índice

1. [Health](#1-health)
2. [Auth](#2-auth)
3. [Catálogo (Categorias e Produtos)](#3-catálogo-categorias-e-produtos)
4. [Pedidos](#4-pedidos)
5. [Pagamento](#5-pagamento)
6. [Envio (Shipping)](#6-envio-shipping)
7. [Estoque](#7-estoque)
8. [Mídia](#8-mídia)
9. [Dashboard](#9-dashboard)
10. [Webhooks](#10-webhooks)
11. [Admin](#11-admin)
12. [Marketing](#12-marketing)

---

## 1. Health

Rotas **públicas** para verificação de saúde da API.

### GET /api/health

Retorna status textual (ex.: `OK`). Sem corpo. Sem autenticação.

```bash
curl -X GET "http://localhost:8080/api/health"
```

**Resposta:** `200 OK` — corpo em texto (ex.: `OK`).

---

### GET /health *(legado)*

Mesmo comportamento que `/api/health`. Mantido por compatibilidade.

```bash
curl -X GET "http://localhost:8080/health"
```

---

## 2. Auth

Rotas **públicas**. Após o login, use o `token` retornado no header `Authorization: Bearer <token>` nas demais rotas.

### POST /api/auth/register

Cria um novo usuário. **Apenas um administrador autenticado** pode chamar esta rota (JWT com `ROLE_ADMIN`). Quem define se o novo usuário é admin é somente outro admin (campo opcional `role`).

**Autenticação:** obrigatória — header `Authorization: Bearer <JWT>` de um usuário com role ADMIN.

**Corpo (JSON):**
| Campo   | Tipo   | Obrigatório | Descrição        |
|---------|--------|-------------|------------------|
| name    | string | Sim         | Nome do usuário  |
| email   | string | Sim         | E-mail válido    |
| password| string | Sim         | Senha            |
| role    | string | Não         | `"USER"` ou `"ADMIN"`. Só admin pode enviar `"ADMIN"`. Omitido = USER. |

**Exemplo (admin criando usuário comum):**
```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_DO_ADMIN" \
  -d '{"name":"João Silva","email":"joao@email.com","password":"senha123"}'
```

**Exemplo (admin criando outro admin):**
```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_DO_ADMIN" \
  -d '{"name":"Outro Admin","email":"admin2@atelie.com","password":"senha123","role":"ADMIN"}'
```

**Resposta:** `201 Created` — sem corpo. `403 Forbidden` se quem chamar não for admin.

---

### POST /api/auth/login

Faz login e retorna um JWT.

**Corpo (JSON):**
| Campo    | Tipo   | Obrigatório | Descrição |
|----------|--------|-------------|-----------|
| email    | string | Sim         | E-mail    |
| password | string | Sim         | Senha     |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"senha123"}'
```

**Resposta:** `200 OK` — JSON com `token`:
```json
{"token":"eyJhbGciOiJIUzI1NiJ9..."}
```

Use esse `token` nas requisições autenticadas: `Authorization: Bearer <token>`.

---

## 3. Catálogo (Categorias e Produtos)

### Categorias

Base path: **/categories** (sem prefixo `/api`). Rotas exigem **autenticação**, exceto GET se configurado como público.

#### POST /categories

Cria uma categoria.

**Corpo (JSON):**
| Campo  | Tipo    | Obrigatório | Descrição      |
|--------|---------|-------------|----------------|
| name   | string  | Sim         | Nome           |
| active | boolean | Sim         | Ativa ou não   |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"name":"Decoração","active":true}'
```

**Resposta:** `201 Created` — corpo com a categoria criada (ex.: id, name, active).

---

#### GET /categories

Lista todas as categorias. Pode ser público (GET em catálogo).

```bash
curl -X GET "http://localhost:8080/categories" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — array de categorias.

---

### Produtos

Base path: **/api/products**. GET em produtos é **público**; POST/PUT/DELETE e sub-recursos exigem **autenticação**.

#### GET /api/products

Lista todos os produtos. **Público** (sem Bearer).

```bash
curl -X GET "http://localhost:8080/api/products"
```

**Resposta:** `200 OK` — array de produtos.

---

#### GET /api/products/{id}

Busca produto por ID. **Público**.

```bash
curl -X GET "http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440000"
```

**Resposta:** `200 OK` — objeto do produto ou `404 Not Found`.

---

#### POST /api/products

Cria um produto. Exige **autenticação**.

**Corpo (JSON):**
| Campo         | Tipo    | Obrigatório | Descrição                    |
|---------------|---------|-------------|------------------------------|
| name          | string  | Sim         | Nome do produto              |
| description   | string  | Não         | Descrição                    |
| price         | number  | Não         | Preço                        |
| stockQuantity | integer | Não         | Quantidade em estoque       |
| categoryId    | UUID    | Sim         | ID da categoria              |
| images        | array   | Não         | Lista de URLs de imagens     |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{
    "name":"Vela Artesanal",
    "description":"Vela de soja",
    "price":29.90,
    "stockQuantity":50,
    "categoryId":"550e8400-e29b-41d4-a716-446655440000",
    "images":[]
  }'
```

**Resposta:** `200 OK` — produto criado.

---

#### POST /api/products/upload-image

Upload de imagem para produto (nome seguro, validação de tipo/tamanho). Exige **autenticação**. Retorna URL relativa (ex.: `/uploads/uuid.png`).

**Corpo:** `multipart/form-data` com campo `file`.

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/products/upload-image" \
  -H "Authorization: Bearer SEU_JWT" \
  -F "file=@/caminho/para/imagem.jpg"
```

**Resposta:** `200 OK` — texto com path, ex.: `"/uploads/a1b2c3d4-....jpg"`. `400` se arquivo inválido (tipo/tamanho).

---

#### PUT /api/products/{id}

Atualiza um produto. Exige **autenticação**. Envie os campos a alterar (entity completa no controller).

```bash
curl -X PUT "http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"name":"Vela Atualizada","description":"...","price":35.00,"stockQuantity":40,"images":[]}'
```

**Resposta:** `200 OK` — produto atualizado ou `404 Not Found`.

---

#### DELETE /api/products/{id}

Remove um produto. Exige **autenticação**.

```bash
curl -X DELETE "http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `204 No Content` ou `404 Not Found`.

---

### Variantes de produto

#### POST /api/products/{productId}/variants

Cria uma variante para o produto. Exige **autenticação**.

**Corpo (JSON):**
| Campo         | Tipo   | Obrigatório | Descrição                          |
|---------------|--------|-------------|------------------------------------|
| sku           | string | Sim         | SKU da variante                    |
| gtin          | string | Não         | Código de barras                   |
| price         | number | Não         | Preço da variante                  |
| initialStock  | int    | Sim (≥0)    | Estoque inicial                    |
| attributesJson| string | Não         | JSON de atributos, ex.: `{"tamanho":"M"}` |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/products/PRODUCT_UUID/variants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"sku":"VELA-M","gtin":null,"price":29.90,"initialStock":20,"attributesJson":"{\"tamanho\":\"M\"}"}'
```

**Resposta:** `200 OK` — variante criada.

---

#### GET /api/products/{productId}/variants

Lista variantes do produto. Exige **autenticação**.

```bash
curl -X GET "http://localhost:8080/api/products/PRODUCT_UUID/variants" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — array de variantes.

---

### Imagem de produto (por productId)

#### POST /api/products/{productId}/image

Upload de imagem associada ao produto. Exige **autenticação**. Corpo: `multipart/form-data`, campo `file`.

```bash
curl -X POST "http://localhost:8080/api/products/PRODUCT_UUID/image" \
  -H "Authorization: Bearer SEU_JWT" \
  -F "file=@/caminho/imagem.png"
```

**Resposta:** `200 OK` — nome do arquivo armazenado (string). `400` se produto não existir ou arquivo inválido.

---

### Integração de produto (marketplace)

#### POST /api/products/{productId}/integrations

Vincula produto a um marketplace (ex.: Mercado Livre, Shopee). Exige **autenticação**.

**Corpo (JSON):**
| Campo          | Tipo   | Obrigatório | Descrição                          |
|----------------|--------|-------------|------------------------------------|
| integrationType| string | Sim         | Ex.: `"MERCADO_LIVRE"`, `"SHOPEE"` |
| externalId     | string | Sim         | ID no marketplace                   |
| skuExternal    | string | Não         | SKU no marketplace                  |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/products/PRODUCT_UUID/integrations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"integrationType":"MERCADO_LIVRE","externalId":"MLB123456","skuExternal":"SKU-ML"}'
```

**Resposta:** `200 OK` — sem corpo.

---

### IA (descrição e fundo)

#### POST /api/products/{id}/ai/generate-description

Gera descrição para o produto via IA. Exige **autenticação**. Sem corpo.

```bash
curl -X POST "http://localhost:8080/api/products/PRODUCT_UUID/ai/generate-description" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — JSON: `{"description":"..."}`. O front pode exibir para o admin editar e salvar via PUT do produto.

---

#### POST /api/products/{id}/ai/remove-background

Remove fundo da imagem do produto (e atualiza o produto). Exige **autenticação**. Sem corpo.

```bash
curl -X POST "http://localhost:8080/api/products/PRODUCT_UUID/ai/remove-background" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — JSON: `{"newImageUrl":"..."}`. `400` se o produto não tiver imagem.

---

## 4. Pedidos

Base path: **/api/orders**. Exige **autenticação**.

### POST /api/orders

Cria um pedido.

**Corpo (JSON):**
| Campo       | Tipo   | Obrigatório | Descrição           |
|-------------|--------|-------------|---------------------|
| source      | string | Sim         | Ex.: `"SITE"`, `"MERCADO_LIVRE"` |
| externalId  | string | Sim         | ID externo do pedido |
| customerName| string | Sim         | Nome do cliente      |
| items       | array  | Sim (não vazio) | Lista de itens   |

Cada item:
| Campo     | Tipo   | Obrigatório | Descrição        |
|-----------|--------|-------------|------------------|
| productId | UUID   | Sim         | ID do produto    |
| variantId | UUID   | Não         | ID da variante (se houver) |
| quantity  | int    | Sim (≥1)    | Quantidade       |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{
    "source":"SITE",
    "externalId":"PED-001",
    "customerName":"Maria Santos",
    "items":[
      {"productId":"550e8400-e29b-41d4-a716-446655440000","variantId":null,"quantity":2}
    ]
  }'
```

**Resposta:** `201 Created` — objeto do pedido (id, status, totalAmount, items, etc.).

---

### GET /api/orders

Lista pedidos com paginação. Query params: `page`, `size`, `sort` (ex.: `sort=createdAt,desc`). Padrão: size=20, sort=createdAt,desc.

```bash
curl -X GET "http://localhost:8080/api/orders?page=0&size=10" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — página Spring (content, totalElements, totalPages, etc.).

---

## 5. Pagamento

Base path: **/api/payments**. Exige **autenticação**.

### POST /api/payments/pix

Cria pagamento PIX para um pedido.

**Corpo (JSON):**
| Campo   | Tipo   | Obrigatório | Descrição        |
|---------|--------|-------------|------------------|
| orderId | UUID   | Sim         | ID do pedido     |
| email   | string | Sim         | E-mail (válido)  |
| cpf     | string | Sim         | CPF do pagador   |
| amount  | number | Sim (>0)    | Valor            |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/payments/pix" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"orderId":"ORDER_UUID","email":"cliente@email.com","cpf":"12345678900","amount":99.90}'
```

**Resposta:** `200 OK` — objeto de resposta do pagamento (ex.: link PIX, status), conforme `PaymentResponse`.

---

## 6. Envio (Shipping)

Base path: **/api/shipping**. Rotas **públicas** (checkout).

### POST /api/shipping/quote

Obtém cotação de frete.

**Corpo (JSON):**
| Campo    | Tipo   | Obrigatório | Descrição                          |
|----------|--------|-------------|------------------------------------|
| cep      | string | Sim         | CEP destino                         |
| subtotal | number | Sim         | Subtotal do pedido                  |
| provider | string | Não         | Forçar provedor (ex.: `"J3"`, `"FLAT_RATE"`) |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/shipping/quote" \
  -H "Content-Type: application/json" \
  -d '{"cep":"01310100","subtotal":150.00,"provider":null}'
```

**Resposta:** `200 OK` — objeto com cotação (ex.: valor, prazo), conforme `ShippingQuoteResponse`.

---

### POST /api/shipping/configs/refresh

Recarrega cache de configs de envio (uso operacional). Exige **autenticação** (rota não está em permitAll explícito para POST; na prática pode exigir auth).

```bash
curl -X POST "http://localhost:8080/api/shipping/configs/refresh" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `204 No Content`.

---

## 7. Estoque

Base path: **/api/inventory**. Exige **autenticação**.

### GET /api/inventory/{variantId}

Consulta estoque calculado da variante.

```bash
curl -X GET "http://localhost:8080/api/inventory/VARIANT_UUID" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — JSON: `{"variantId":"...", "stock": 42}`.

---

### POST /api/inventory/{variantId}

Registra movimentação de estoque (entrada/saída).

**Corpo (JSON):**
| Campo      | Tipo   | Obrigatório | Descrição                          |
|------------|--------|-------------|------------------------------------|
| type       | string | Sim         | `"IN"` ou `"OUT"`                   |
| quantity   | int    | Sim (>0)    | Quantidade                          |
| reason     | string | Não         | Motivo                              |
| referenceId| string | Não         | Referência externa (ex.: pedido)    |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/inventory/VARIANT_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT" \
  -d '{"type":"IN","quantity":10,"reason":"Ajuste manual","referenceId":null}'
```

**Resposta:** `200 OK` — sem corpo.

---

## 8. Mídia

Base path: **/api/media**. Upload exige **autenticação**. GET público só em **/api/media/public/{id}**.

### POST /api/media/upload

Upload de arquivo (imagem). Valida tipo MIME e tamanho (configurável por env).

**Corpo:** `multipart/form-data`
| Campo    | Tipo | Obrigatório | Descrição                    |
|----------|------|-------------|------------------------------|
| file     | file | Sim         | Arquivo                      |
| category | string | Não       | Categoria do asset           |
| public   | boolean | Não (default false) | Se é público |

**Exemplo:**
```bash
curl -X POST "http://localhost:8080/api/media/upload" \
  -H "Authorization: Bearer SEU_JWT" \
  -F "file=@/caminho/foto.jpg" \
  -F "category=products" \
  -F "public=true"
```

**Resposta:** `200 OK` — entidade do asset (id, filename, category, etc.).

---

### GET /api/media/public/{id}

Baixa um asset público por ID. **Público** (sem Bearer).

```bash
curl -X GET "http://localhost:8080/api/media/public/1" -o arquivo.jpg
```

**Resposta:** `200 OK` — stream do arquivo. `404` se não existir ou não for público.

---

## 9. Dashboard

Base path: **/api/dashboard**. Exige **autenticação**.

### GET /api/dashboard/summary

Resumo para o painel: total de produtos, vendas, pedidos pendentes, alertas de estoque baixo.

```bash
curl -X GET "http://localhost:8080/api/dashboard/summary" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — JSON:
```json
{
  "totalProducts": 42,
  "totalSales": 15000.00,
  "pendingOrders": 5,
  "lowStockAlerts": 2
}
```

---

### GET /api/dashboard/automation/status

Indica se a automação (N8n) está habilitada.

```bash
curl -X GET "http://localhost:8080/api/dashboard/automation/status" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — JSON: `{"enabled": true}` ou `{"enabled": false}`.

---

### GET /api/dashboard/products

Lista produtos no formato do dashboard (admin). Exige **autenticação**.

```bash
curl -X GET "http://localhost:8080/api/dashboard/products" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — array de produtos (DTO com id, name, description, price, categoryId, active, imageUrl).

---

### PUT /api/dashboard/products/{id}/toggle-alert

Ativa/desativa alerta de estoque baixo para o produto. Exige **autenticação**.

```bash
curl -X PUT "http://localhost:8080/api/dashboard/products/PRODUCT_UUID/toggle-alert" \
  -H "Authorization: Bearer SEU_JWT"
```

**Resposta:** `200 OK` — produto atualizado (com alertEnabled invertido).

---

## 10. Webhooks

Base path: **/api/webhooks**. **Públicas** no sentido de não exigir JWT; porém **obrigatório** o header **X-Webhook-Token** com o valor de `WEBHOOK_SECRET` (env).

### POST /api/webhooks/mercadopago

Recebe notificação do Mercado Pago. O token deve ser igual a `WEBHOOK_SECRET` (comparação em tempo constante).

**Headers obrigatórios:**
- `Content-Type: application/json`
- `X-Webhook-Token`: valor idêntico à variável de ambiente `WEBHOOK_SECRET`

**Corpo (JSON):** Payload enviado pelo Mercado Pago. A API espera, entre outros:
- `external_reference` ou `order_id` — identificador do pedido (UUID)
- `status` — ex.: `"approved"`, `"rejected"`, `"cancelled"`
- `transaction_amount` — valor pago (para validação em aprovação)

**Exemplo (simulado):**
```bash
curl -X POST "http://localhost:8080/api/webhooks/mercadopago" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: SEU_WEBHOOK_SECRET_DO_ENV" \
  -d '{
    "external_reference": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "transaction_amount": 99.90
  }'
```

**Resposta:** `200 OK` na maioria dos casos (processamento assíncrono). `403` se token ausente ou inválido. `400` em caso de erro de validação (ex.: valor pago menor que o total).

---

## 11. Admin

Base path: **/api/admin/...**. **Todas** as rotas de admin exigem **ROLE_ADMIN** (usuário autenticado com perfil Admin). Use sempre `Authorization: Bearer <JWT>` de um usuário admin.

### Gestão de Equipe (Admin)

Base path: **/api/admin/users**. Exige **ROLE_ADMIN**.

#### GET /api/admin/users
Lista todos os membros da equipe.

#### POST /api/admin/users
Convida um novo membro. Recebe `CreateUserDTO` (name, email, password, role).

#### PUT /api/admin/users/{id}
Atualiza dados de um membro existente.

#### DELETE /api/admin/users/{id}
Remove um membro da equipe.

---

### Regras de roteamento (Service Engine)

#### GET /api/admin/rules

Lista regras de roteamento. Query opcional: `type` (ex.: `PAYMENT`, `SHIPPING`).

```bash
curl -X GET "http://localhost:8080/api/admin/rules" \
  -H "Authorization: Bearer JWT_ADMIN"
curl -X GET "http://localhost:8080/api/admin/rules?type=PAYMENT" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — array de regras (serviceType, providerCode, enabled, priority, matchJson, behaviorJson, etc.).

---

#### POST /api/admin/rules

Cria uma regra. Corpo: entidade com `serviceType`, `providerCode`, `enabled`, `priority`, `matchJson` (JSON/SpEL), opcionalmente `behaviorJson`. `id` e `updatedAt` podem ser gerados pelo servidor.

**Exemplo (estrutura):**
```json
{
  "serviceType": "PAYMENT",
  "providerCode": "MERCADO_PAGO",
  "enabled": true,
  "priority": 1,
  "matchJson": "{\"expression\": \"#ctx.country == 'BR'\"}"
}
```

```bash
curl -X POST "http://localhost:8080/api/admin/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_ADMIN" \
  -d '{"serviceType":"PAYMENT","providerCode":"MERCADO_PAGO","enabled":true,"priority":1,"matchJson":"{\"expression\": \"#ctx.country == '\''BR'\''\"}"}'
```

**Resposta:** `200 OK` — regra criada. `400` se SpEL inválido.

---

#### PUT /api/admin/rules/{id}

Atualiza a regra. Corpo igual ao POST (inclua `id` no path).

**Resposta:** `200 OK` ou `404 Not Found`.

---

#### DELETE /api/admin/rules/{id}

Remove a regra.

```bash
curl -X DELETE "http://localhost:8080/api/admin/rules/RULE_UUID" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `204 No Content`.

---

### Provedores de serviço

#### GET /api/admin/providers

Lista todos os provedores.

```bash
curl -X GET "http://localhost:8080/api/admin/providers" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — array (id, serviceType, code, name, enabled, priority, driverKey, healthEnabled, etc.).

---

#### POST /api/admin/providers

Cria provedor. Corpo: `serviceType`, `code`, `name`, `enabled`, `priority`, `driverKey`, `healthEnabled`, etc.

**Resposta:** `200 OK` — provedor criado.

---

#### PUT /api/admin/providers/{id}

Atualiza provedor. Corpo com os campos a alterar.

**Resposta:** `200 OK` ou `404 Not Found`.

---

#### PATCH /api/admin/providers/{id}/toggle

Ativa/desativa o provedor. Corpo: `true` ou `false` (boolean).

```bash
curl -X PATCH "http://localhost:8080/api/admin/providers/PROVIDER_UUID/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_ADMIN" \
  -d 'false'
```

**Resposta:** `200 OK` — provedor atualizado ou `404 Not Found`.

---

### Configuração de provedor (por ambiente)

#### GET /api/admin/provider-configs/{providerId}/{env}

Obtém a config mais recente do provedor para o ambiente (ex.: `dev`, `prod`).

```bash
curl -X GET "http://localhost:8080/api/admin/provider-configs/PROVIDER_UUID/prod" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — entidade de config (providerId, environment, configJson, version, etc.) ou `404 Not Found`.

---

#### POST /api/admin/provider-configs

Cria ou atualiza config (upsert). Corpo: `providerId`, `environment`, `configJson`, etc. Version é incrementado automaticamente.

**Resposta:** `200 OK` — config salva.

---

### Configurações globais (system config)

#### GET /api/admin/configs

Lista todas as configs do sistema (chave/valor/JSON).

```bash
curl -X GET "http://localhost:8080/api/admin/configs" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — array de configs (configKey, configValue, configJson).

---

#### POST /api/admin/configs

Cria ou atualiza config. Corpo: `configKey`, `configValue`, opcionalmente `configJson`.

**Resposta:** `200 OK` — config salva.

---

#### DELETE /api/admin/configs/{key}

Remove config pela chave.

```bash
curl -X DELETE "http://localhost:8080/api/admin/configs/MINHA_CHAVE" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `204 No Content`.

---

### Feature flags

#### GET /api/admin/features

Lista feature flags.

```bash
curl -X GET "http://localhost:8080/api/admin/features" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — array (flagKey, enabled, valueJson, etc.).

---

#### POST /api/admin/features

Cria ou atualiza flag por `flagKey`. Corpo: `flagKey`, `enabled`, opcionalmente `valueJson`.

**Resposta:** `200 OK` — flag salva.

---

### Pedidos (admin)

#### POST /api/admin/orders/{id}/cancel

Cancela um pedido. Corpo opcional: `{"reason": "Motivo do cancelamento"}`.

```bash
curl -X POST "http://localhost:8080/api/admin/orders/ORDER_UUID/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_ADMIN" \
  -d '{"reason":"Solicitação do cliente"}'
```

**Resposta:** `200 OK` — sem corpo. Se não enviar body, usa "Admin request" como motivo.

---

### Cache (admin)

#### POST /api/admin/cache/refresh

Dispara evento global de refresh para todos os listeners de cache (gateways, config service).

```bash
curl -X POST "http://localhost:8080/api/admin/cache/refresh" \
  -H "Authorization: Bearer JWT_ADMIN"
```

**Resposta:** `200 OK` — JSON: `{"ok": true, "message": "..."}`.

---

924: ---
925: 
926: ## 12. Marketing
927: 
928: Base path: **/api/marketing/...**. Rotas de gestão exigem **autenticação**.
929: 
930: ### Cupons
931: 
932: Base path: **/api/marketing/coupons**.
933: 
934: #### GET /api/marketing/coupons
935: Lista todos os cupons.
936: 
937: #### POST /api/marketing/coupons
938: Cria um cupom.
939: 
940: #### PATCH /api/marketing/coupons/{id}
941: Alterna o status do cupom. Corpo: `{"active": true/false}`.
942: 
943: #### PUT /api/marketing/coupons/{id}
944: Atualiza dados completos de um cupom (código, valor, limite).
945: 
946: #### DELETE /api/marketing/coupons/{id}
947: Remove um cupom.
948: 
949: ---
950: 
951: ### Carrinho Abandonado
952: 
953: Base path: **/api/marketing/abandoned-carts**.
954: 
955: #### GET /api/marketing/abandoned-carts
956: Obtém configurações de recuperação de carrinho.
957: 
958: #### PUT /api/marketing/abandoned-carts
959: Atualiza configurações (delay, assunto, habilitado).
960: 
961: ---
962: 
963: ## Resumo de autenticação por área

| Área        | Rotas públicas (sem JWT)                    | Rotas com JWT        |
|-------------|---------------------------------------------|----------------------|
| Health      | GET /api/health, GET /health                 | —                    |
| Auth        | POST /api/auth/login                           | POST /api/auth/register (apenas ADMIN) |
| Catálogo    | GET /categories, GET /api/products, GET /api/products/{id} | POST/PUT/DELETE produtos, variantes, integrações, AI, imagens |
| Pedidos     | —                                           | Todas                |
| Pagamento   | —                                           | Todas                |
| Shipping    | POST /api/shipping/quote                    | POST .../configs/refresh (conforme config) |
| Estoque     | —                                           | Todas                |
| Mídia       | GET /api/media/public/{id}                  | POST /api/media/upload |
| Dashboard   | —                                           | Todas                |
| Marketing   | —                                           | Todas                |
| Webhooks    | POST /api/webhooks/mercadopago (com X-Webhook-Token) | —                 |
| Admin       | —                                           | Todas (ROLE_ADMIN)   |

---

*Documento vivo: atualize quando novas rotas forem criadas ou contratos alterados.*
