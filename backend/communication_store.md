# Relatório de Comunicação (Frontend -> Backend) - communication_store

**Última Auditoria Completa:** 2026-02-05
**Status Geral:** O frontend está visualmente completo, mas dependente de correções de integração e novos endpoints no backend para funcionalidades críticas.

---

## 🚀 Erros Críticos de Integração (P1)

### 1. Falha de Autenticação (401 Unauthorized) em Endpoints Admin
Múltiplas rotas administrativas estão retornando 401, mesmo com o token JWT do admin presente. Isso impede o carregamento de dados reais no dashboard e outras páginas.
- **Endpoints Afetados:**
    - `GET /api/admin/tenants`
    - `GET /api/analytics/dashboard`
    - `GET /api/admin/orders`
    - `GET /api/admin/users`
    - `GET /api/admin/audit-logs`

### 2. Erro na Criação de Produtos (400 Bad Request)
Ao tentar salvar um novo produto através do formulário, o backend retorna erro 400.
- **Endpoint:** `POST /api/products`
- **Sintoma:** O formulário não fecha e não há feedback claro do motivo da rejeição dos dados.

### 3. Recuperação de Carrinho Abandonado (Crash de Módulo)
A página de Marketing > Recuperação não carrega os dados e exibe erro de módulo.
- **Sintoma:** Provável falha no endpoint `/api/marketing/abandoned-carts` ou retorno de estrutura de dados incompleta (faltando lista de `triggers`).

---

## 🛠️ Funcionalidades Faltantes ou Incompletas (P2)

### 1. Gerenciamento de Lojas (Onboarding)
- **Criação de Loja:** O botão "+ Criar Nova Loja" no seletor do topo não executa nenhuma ação. Falta o modal ou a rota de backend para criação de tenants.
- **Exclusão/Desativação:** Não existe interface para deletar ou desativar uma loja existente.

### 2. Configurações de Frete e Pagamento
- **ERRO ARQUITETURAL:** O PIX não deve ser um provedor isolado (`code: PIX`). Ele é um **método de pagamento** dentro de um gateway (ex: Mercado Pago). Favor remover `PIX` da lista de provedores.
- **Estruturação do Conector (Mercado Pago):** O frontend agora espera que o backend suporte a seguinte estrutura no `configJson`:
    1. **Identificação:** Nome do conector, Ativo (bool), Moeda (BRL), País (BR).
    2. **Credenciais:** Mercado Pago Public Key (usada no checkout) e Access Token (usada no backend).
    3. **Webhooks:** URL, Secret de assinatura e lista de eventos (necessário para status real).
    4. **Sincronização:** Backend deve prover `GET /v1/payment_methods` chamando a API do MP.
    5. **Configurações por Método:**
        - **Cartão:** Parcelas (max/sem juros), descriptor, auto_capture, binary_mode.
        - **Pix:** Tempo de expiração e instruções.
        - **Boleto:** Dias para vencimento e instruções.
    6. **Regras Globais:** Idempotência (`uuid_per_attempt`) e metadados.
    7. **Dados do Pagador:** Email (sempre), Nome/Documento (configuráveis como obrigatório/opcional).

- **Necessidade Técnica:** O backend deve ser capaz de processar o payload de pagamento recebendo `token`, `transaction_amount`, `installments`, `payment_method_id` e `payer.email` vindo do frontend/bricks.

### 3. Catálogo de Produtos
- **Busca/Listagem:** A listagem de produtos no admin frequentemente aparece vazia ("Nenhum produto encontrado"), mesmo quando deveria haver dados.
- **Categorias:** Necessário garantir que as categorias sejam buscadas corretamente para preencher o select no cadastro de produtos.

---

## 📊 Segunda Auditoria Completa (2026-02-05 23:45)

### Endpoints Backend Necessários

#### 1. Dashboard Metrics (P1 - Alta Prioridade)
**Endpoint Faltante:** `GET /api/admin/dashboard/metrics`
**Descrição:** O frontend precisa de métricas agregadas para exibir no dashboard.
**Payload Esperado:**
```json
{
  "totalSales": 15000.00,
  "totalRevenue": 45000.00,
  "pendingOrders": 5,
  "completedOrders": 120,
  "period": "MONTH"
}
```
**Status Atual:** Frontend removeu cards placeholder para evitar confusão do usuário.

#### 2. Product CRUD Completo (P1 - Alta Prioridade)
**Endpoints:**
- `PUT /api/admin/products/{id}` - Atualizar produto
- `DELETE /api/admin/products/{id}` - Excluir produto

**Status:** Frontend implementou handlers, mas precisa confirmar se endpoints existem.
**Teste Necessário:** Verificar se `/products/{id}` aceita PUT e DELETE com autenticação admin.

#### 3. Provider Configuration Retrieval (P2 - Média Prioridade)
**Endpoint:** `GET /api/admin/provider-configs/{providerId}`
**Problema:** Ao abrir o editor de configuração, o frontend não consegue carregar a config existente.
**Impacto:** Usuário não pode editar configurações, apenas criar novas.
**Fix Esperado:** Backend deve retornar a última configuração salva para o provedor.

#### 4. Abandoned Cart Configuration (P2 - Média Prioridade)
**Endpoint:** `GET /api/marketing/abandoned-carts`
**Problema:** Retorno incompleto ou estrutura de dados sem lista de `triggers`.
**Impacto:** Página de recuperação de carrinho não carrega.
**Fix Esperado:** Garantir que o retorno sempre inclua:
```json
{
  "enabled": true,
  "triggers": [
    { "delayMinutes": 60, "emailTemplate": "..." }
  ]
}
```

### Validações de Segurança

#### 1. Autenticação Admin
**Problema:** Alguns endpoints retornam 401 mesmo com token JWT válido.
**Endpoints Afetados:** `/api/admin/tenants`, `/api/analytics/dashboard`, `/api/admin/orders`
**Ação Necessária:** Revisar filtros de segurança e roles no backend.

---

## ✅ Itens Corrigidos/Funcionais
- **Login:** Autenticação inicial funcionando.
- **Cupons:** Criação, listagem e exclusão de cupons de marketing operacionais.
- **Equipe e Auditoria:** Listagem de usuários e logs de auditoria visíveis (quando o 401 não ocorre).
- **Dashboard UI:** Gráficos e cartões renderizam corretamente (embora com dados temporários/mockados por falha de API).
- **Produtos:** CRUD completo implementado no frontend (aguardando confirmação de endpoints backend).
- **Configurações:** Gestão de provedores de Pagamento e Frete com CRUD funcional.

---
*Este documento deve ser atualizado pelo backend conforme as correções forem aplicadas.*
