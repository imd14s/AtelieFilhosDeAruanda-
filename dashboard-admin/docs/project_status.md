# Status do Projeto: Dashboard Admin v2.0

Atualizado em: 04/02/2026

## ✅ 1. Funcionalidades Implementadas (Pronto)

### Fundação & MVP
- [x] **Arquitetura Base**: React 19 + Vite + TypeScript.
- [x] **Autenticação**: Login simples com JWT e Persistência de Sessão (`AuthContext`).
- [x] **Integração Backend**: API Client configurado (Axios + Interceptors).

### Multi-Tenancy (Fase 1 - Parcial)
- [x] **Serviço de Tenants**: Estrutura de dados e Mock service criados.
- [x] **Contexto Global**: `TenantProvider` gerenciando a loja selecionada.
- [x] **Seletor de Loja**: UI implementada na Sidebar para troca rápida de contexto.

### Funcionalidades Básicas
- [x] **Produtos (Simples)**: Listagem e "Toggle Alert" de estoque.
- [x] **Pedidos**: Listagem e Modal de Cancelamento (UI Ok, Backend 500*).
- [x] **Configurações**: CRUD de variáveis de sistema (UI Ok, Backend 500*).

---

## 🚧 2. Em Progresso / Próximos Passos

### Fase 1: Multi-Tenancy & Segurança
- [ ] **Gestão de Acessos**: Definir perfis (Admin, Equipe) no Frontend.
- [ ] **Auditoria**: Tela de logs de atividade.

### Fase 2: Catálogo Avançado
- [ ] **Editor de Produto v2**: Suporte a Variantes (Cor/Tamanho).
- [ ] **Galeria de Mídia**: Upload múltiplo.
- [ ] **Editor IA**: Interface para remover fundo e gerar mockups.

---

## 📅 3. Planejado (Roadmap)

### Fase 3: Operações
- [ ] Módulo de Frete (Regras de envio).
- [ ] Módulo de Pagamento (Credenciais).

### Fase 4: Marketing
- [ ] Cupons de Desconto.
- [ ] Recuperação de Carrinho (E-mail).

### Fase 5: Analytics & Onboarding
- [ ] Dashboards Gráficos.
- [ ] Wizard de Criação de Loja.

---

## 🚨 4. Pontos de Atenção (Backend Alignment)
*Funcionalidades que dependem de correções no Backend:*
1.  **Cancelamento de Pedido**: Endpoint retornando 500.
2.  **Criação de Configuração**: Endpoint retornando 500 (`IdentifierGenerationException`).
3.  **Multi-Tenancy**: Backend precisa validar o header `X-Tenant-ID`.
