# Status do Projeto — Ateliê Filhos de Aruanda

**Última atualização:** 2026-02-10
**Objetivo:** Centralizar o status das funcionalidades, débitos técnicos e roadmap.

---

## 1. Estado Atual: Fase 6 (CRUD & UX) - Validação 🔄

Estamos na fase final de validação das funcionalidades de gestão.

### ✅ Avanços Recentes (Concluídos)
- **ProductForm (Edit Mode)**: Refatorado para usar UUIDs de categorias (corrige Erro 500 relatado).
- **Team Management**: Endpoints `PUT` e `DELETE` implementados em `AdminUserController`.
- **Backend Security**: Endpoints `/api/auth/register` e `/api/auth/verify` marcados como `permitAll()`.
- **Infra de Testes**: Suítes de testes presentes no Backend (28 arquivos), Loja (19 testes) e Dashboard (14 testes).

### ⚠️ Inconsistências & Bloqueios (Ações Necessárias)
- **Restart do Backend**: Muitas correções de segurança (`SecurityConfig`) exigem o restart do serviço para sanar erros 401 relatados.
- **Divergência Documental**: O arquivo `RELATORIO_TESTE_VISUAL.md` ainda lista o Erro 500 de produtos como "Falha", mas o código do `ProductForm.tsx` já foi atualizado para usar IDs.
- **Relatório de Testes**: `_audit/PROJECT_STATUS.md` anterior afirmava 0% de cobertura no backend, o que é falso. O diretório `src/test` existe e está populado.

---

## 2. Mapa de Funcionalidades (Real vs Doc)

### 2.1 Backend API (`/backend`)
- [x] **Auth**: Login, Registro (Público), Webhooks (Token-based).
- [x] **Catálogo**: CRUD de Produtos e Categorias.
- [x] **Marketing**: Cupons e Carrinho Abandonado (Endpoints base).
- [x] **Gestão de Equipe**: CRUD completo em `/api/admin/users`.

### 2.2 Dashboard Admin (`/dashboard-admin`)
- [x] **Produtos**: Listagem e edição funcional.
- [x] **Equipe**: Gestão completa funcional.
- [!] **Marketing**: Interface de Cupons ainda precisa de expansão (Visualização apenas).

### 2.3 Storefront (`/frontend`)
- [x] **Fluxo de Compra**: Home -> Shop -> Product -> Cart -> Checkout (Funcional).
- [x] **SEO**: Componente `SEO.jsx` integrado e testado.

---

## 3. Débitos Técnicos & Pendências (Backlog)

### Alta Prioridade (P1)
- [ ] **Garantir Restart**: Validar se alterações no `SecurityConfig.java` foram carregadas no container.
- [ ] **Reflexão Duplicada**: Extrair `ReflectionPropertyUtils` (lógica comum entre `MediaStorageService` e `PaymentService`).
- [ ] **Interface OrderRepository**: Unificar ou renomear interfaces duplicadas (domain vs infrastructure).

### Média Prioridade (P2)
- [ ] **ProductService**: Mover lógica de update remanescente do `ProductController` para o `ProductService`.
- [ ] **Environment Docs**: Atualizar `.env.example` com todas as novas variáveis (`ALLOWED_IMAGE_MIME`, etc).

---

## 4. Próximos Passos
1. Validar fluxo de convite de equipe após restart completo do ambiente Docker.
2. Executar auditoria de segurança nos novos endpoints de Admin.
3. Padronizar DTOs de resposta para erros de validação (400 Bad Request).
