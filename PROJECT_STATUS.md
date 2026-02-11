# Project Status & Roadmap

Este documento serve como mapa central para o estado atual do projeto, funcionalidades existentes e plano de correções. Deve ser atualizado a cada nova funcionalidade ou refatoração.

> **IMPORTANTE**: Siga estritamente o [Fluxo de Trabalho](WORKFLOW.md) definido.

## 1. Estado Atual: Fase 6 (CRUD & UX) - Concluída ✅
As funcionalidades de gestão principal foram implementadas e estão em fase de validação final.

### Avanços Recentes
- [x] **ProductForm (Edit Mode)**: Implementada população automática de dados e lógica dinâmica de Create/Update.
- [x] **Backend Integration**: Adicionadas anotações `@JsonProperty` em `ProductEntity` para compatibilidade title/stock com frontend.
- [x] **Team Management**: Implementados endpoints `PUT` e `DELETE` em `AdminUserController`.
- [x] **UX Improvements**: Refatoração do modal de convite de equipe e feedback visual de exclusão.

## 2. Resumo de Testes & Qualidade
Referência detalhada em `TEST_COVERAGE.md`.

- **🟢 Backend**: 100% de sucesso nos testes críticos integration (`AbandonedCart`, `AdminAuth`, `ProductController`).
- **🔵 Storefront**: 16 testes passando (Auth, Cart Logic, Product Cards).
- **🟠 Admin Dashboard**: 7 testes básicos de UI e Validação de Formulários passando.
- **🛡️ Segurança**: Endpoints públicos/privados revisados e corrigidos no `SecurityConfig.java`.

---

## 3. Mapa de Funcionalidades Detalhado

### 3.1 Backend API (`/backend`)
- [x] **Autenticação & Usuários**: Login Admin/Customer, Registro, Google Mock, Gestão de Equipe (CRUD completo).
- [x] **Catálogo**: CRUD de Produtos (completo), Categorias (completo), Busca Paginada.
- [x] **Marketing**: Cupons, Carrinho Abandonado (Endpoints base implementados).
- [x] **Infraestrutura**: Docker Compose, Flyway, JWT Security, AI Integration (Contoller/Service).

### 3.2 Dashboard Admin (`/dashboard-admin`)
- [x] **Login**: Página funcional com redirecionamento de role.
- [x] **Gestão de Produtos**: Listagem, Criação e Edição (funcionais).
- [x] **Gestão de Equipe**: Listagem, Convite, Edição e Exclusão (funcionais).
- [ ] **Marketing**: Visualização de Cupons e Carrinhos (Interface a ser expandida).

### 3.3 Storefront (`/frontend`)
- [x] **Páginas Core**: Home, Shop, Product, Search, Checkout (funcionais com mock/API).
- [x] **AuthModal**: Fluxo unificado de Login/Registro/Verificação.

---

## 5. Histórico de Versões
- **v0.2.0** (Atual): CRUD de Produtos e Equipe completo, Integração de DTOs backend/frontend.
- **v0.1.0**: Implementação inicial de Auth e Roles (Admin/Customer).
