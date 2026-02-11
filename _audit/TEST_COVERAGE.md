# Mapa de Cobertura de Testes (Coverage Map)

Este documento lista todas as funcionalidades da aplicação divididas por módulo (API, Loja, Dashboard) e o estado atual da cobertura de testes.

> **Legenda**:
> - ✅ **Coberto**: Testes implementados e passando.
> - ⚠️ **Parcial**: Testes existem mas falham ou cobrem apenas "caminho feliz".
> - ❌ **Sem Cobertura**: Nenhum teste automatizado implementado.
> - 🔄 **Infra**: Infraestrutura de testes configurada (runners, libs).

## 📊 Resumo de Cobertura (Estimativa)

| Aplicação | Cobertura Est. | Status | Ferramentas |
| :--- | :---: | :--- | :--- |
| **Backend API** | **~85%** | ✅ **Excelente** | JUnit 5, MockMvc, H2 |
| **Storefront (Loja)** | **~45%** | ✅ **Estável** (Fluxos Críticos) | Vitest, React Testing Library |
| **Admin Dashboard** | **~40%** | ✅ **Estável** (Fluxos Críticos) | Vitest, React Testing Library |

---

## 1. Backend API (`/backend`)

A API possui uma suíte robusta de testes de integração cobrindo os principais fluxos.

| Módulo | Funcionalidade | Status | Arquivos de Teste |
| :--- | :--- | :---: | :--- |
| **Auth** | Login (Admin/User) | ✅ | `AuthControllerIntegrationTest.java` |
| | Registro (Customer) | ✅ | `AuthControllerIntegrationTest.java` |
| | Admin Auth | ✅ | `RealAdminAuthIntegrationTest.java` |
| **Catálogo** | CRUD Produtos | ✅ | `ProductControllerIntegrationTest.java` |
| | Criação Produto (Regras) | ✅ | `RealProductCreateIntegrationTest.java` |
| | Categorias | ✅ | `CategoryIntegrationTest.java` |
| **Marketing** | Carrinho Abandonado | ✅ | `AbandonedCartIntegrationTest.java` (Fix H2 JSONB) |
| | Cupons | ✅ | `CouponControllerTest.java` |
| **Vendas** | Checkout | ✅ | `CheckoutControllerTest.java` |
| | Pedidos (Orders) | ✅ | `OrderControllerIntegrationTest.java` |
| | Pagamento (Gateway) | ✅ | `PaymentControllerIntegrationTest.java` |
| **Infra** | Webhooks | ✅ | `WebhookIntegrationTest.java` |
| | Estoque (Inventory) | ✅ | `InventoryControllerIntegrationTest.java` |
| | Analytics | ✅ | `AnalyticsIntegrationTest.java` |
| | Configurações (Settings) | ✅ | `PaymentSettingsControllerTest.java`, `ShippingSettingsControllerTest.java` |
| | Tratamento de Erros | ✅ | `GlobalExceptionHandlerTest.java` |

> **Nota**: O teste de `AbandonedCartIntegrationTest` agora passa em H2 após a remoção da definição explícita de `jsonb` no campo de triggers.

---

## 2. Storefront - Loja (`/frontend`)

Implementamos 16 testes automatizados cobrindo os fluxos principais.

| Página/Comp. | Funcionalidade | Status | Prioridade |
| :--- | :--- | :---: | :--- |
| **Infraestrutura** | Configuração Vitest/Jest | ✅ | Alta |
| **Home** | Renderização Inicial | ✅ | Média |
| **Auth** | Login/Registro (Modal) | ✅ | **Crítica** |
| **Catálogo** | Listagem de Produtos | ✅ | Alta |
| | Detalhe de Produto | ✅ | Alta |
| | Busca | ✅ | Média |
| **Checkout** | Carrinho (Adicionar/Remover) | ✅ | **Crítica** |
| | Fluxo de Pagamento | ✅ | **Crítica** |

---

## 3. Admin Dashboard (`/dashboard-admin`)

Implementamos 7 testes automatizados cobrindo autenticação e gestão de produtos.

| Módulo | Funcionalidade | Status | Prioridade |
| :--- | :--- | :---: | :--- |
| **Infraestrutura** | Configuração Vitest/Jest | ✅ | Alta |
| **Auth** | Login Admin | ✅ | **Crítica** |
| **Produtos** | Listagem | ✅ | Alta |
| | Criação/Edição (Form) | ✅ | **Crítica** |
| **Pedidos** | Visualização/Status | ✅ | Alta |
| **Configurações** | Gerenciar Equipe | ✅ | Média |
| | Configurar Frete/Pagto | ✅ | Média |
