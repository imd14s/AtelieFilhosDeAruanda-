# Especificações de Backend: Dashboard Admin v2.0

Este documento lista as necessidades de API, DTOs e Regras de Negócio para suportar as novas funcionalidades do Frontend.

## 1. Arquitetura Multi-Tenant
**Requisito Global**: Todos os endpoints de dados de loja devem exigir o header `X-Tenant-ID` ou derivar o tenant do token JWT do usuário.

### Endpoints Necessários
- `GET /api/admin/tenants`: Listar lojas (apenas Super Admin ou lojas do usuário).
- `POST /api/admin/tenants`: Criar nova loja.
- `PUT /api/admin/tenants/{id}/config`: Atualizar configs base (moeda, idioma, logos).

## 2. Perfis e Permissões (ACL)
O JWT deve conter `roles` e `permissions`.
- **Roles**: `MASTER`, `STORE_ADMIN`, `STORE_TEAM`.
- **Permissions**: `CATALOG_WRITE`, `ORDERS_READ`, `FINANCIAL_READ`, etc.

## 3. Catálogo Avançado
### Produto e Variantes
O modelo de dados deve suportar estrutura hierárquica `Product -> Variants`.

**Importante:** Um mesmo produto "base" pode estar associado a múltiplas lojas (Tenants). O vínculo deve permitir que o produto exista em N catálogos.

**POST /api/products (Payload Sugerido)**
```json
{
  "title": "Camiseta Básica",
  "variants": [
    {
      "sku": "CAM-P",
      "attributes": { "size": "P", "color": "White" },
      "price": 29.90,
      "stock": 100,
      "mediaIds": ["img_123"]
    }
  ],
  "seo": { "slug": "camiseta-basica", "tags": ["verao"] }
}
```

## 4. Mídia e IA
- `POST /api/media/upload`: Multipart file. Deve salvar metadados (loja, dimensões).
- `POST /api/media/edit`: Processamento IA.
    - **Input**: `{ "originalId": "123", "operation": "REMOVE_BG" }`
    - **Output**: `{ "jobId": "abc" }` (Async) ou JSON com url da nova imagem.

## 5 & 6. Frete e Pagamentos
Precisamos de "Drivers" configuráveis no banco.
- `GET /api/settings/shipping-providers`: Lista provedores disponíveis (Correios, etc).
- `PUT /api/settings/shipping-providers/{id}`: Ativar/Desativar e salvar credenciais (encrypted).

## 7. Marketing
- **Carrinho Abandonado**: Job em background para monitorar carrinhos não convertidos.
    - `POST /api/marketing/abandoned-carts/settings`: Definir janelas de tempo (ex: 1h, 24h).
- **Cupons**:
    - Validação complexa no checkout: `POST /api/checkout/validate-coupon`.

## 8. Auth e Cliente
- `POST /api/auth/social-login`: Receber token do provider (Google) e trocar por JWT da loja.
- **Double Opt-in**: Sistema de envio de e-mail de confirmação com token.

## 9. Analytics
Endpoints agregados para performance.
- `GET /api/analytics/dashboard?period=30d`:
```json
{
  "sales": { "total": 15000.00, "count": 120 },
  "funnel": { "visits": 5000, "carts": 200, "checkouts": 150, "sales": 120 }
}
```

## 10. Auditoria
- Middleware global para registrar todas as ações de escrita (POST/PUT/DELETE) em tabela de logs.
- `GET /api/admin/audit-logs`: Filtros por usuário, recurso e data.

---

**Observação**: O Frontend assumirá que as APIs responderão com códigos HTTP padrão (200, 201, 400, 401, 403, 500) e erros em formato JSON padronizado.
