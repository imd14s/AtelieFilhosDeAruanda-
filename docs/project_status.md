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
- [x] **Gestão de Acessos**: Listagem de usuários e exibição de Roles.
- [x] **Auditoria**: Tela de logs de ações do sistema.
- [x] **Editor de Produto v2**: Suporte a Variantes (Cor/Tamanho) e Mídia Múltipla.
- [x] **Config de Loja**: Telas de Frete e Pagamento (Integração Realista definida).
- [x] **Marketing**: Listagem de Cupons e Configuração de Recuperação de Carrinho.
- [x] **Analytics**: Dashboard Inicial com Gráficos (Vendas + Top Produtos).
- [x] **Onboarding**: Wizard de configuração inicial da loja.

---

## 🚧 2. Em Progresso / Próximos Passos

### Fase 1: Multi-Tenancy & Segurança
- [x] **Gestão de Acessos**: Definir perfis (Admin, Equipe) no Frontend.
- [x] **Auditoria**: Tela de logs de atividade.

### Fase 2: Catálogo Avançado
- [x] **Editor de Produto v2**: Suporte a Variantes (Cor/Tamanho).
- [x] **Galeria de Mídia**: Upload múltiplo.
- [x] **Editor IA**: Interface para remover fundo e gerar mockups.

---

## 📅 3. Planejado (Roadmap)

### Fase 3: Operações
- [x] Módulo de Frete (Regras de envio).
- [x] Módulo de Pagamento (Credenciais).

### Fase 4: Marketing
- [x] Cupons de Desconto (Listagem e Actions).
- [x] Recuperação de Carrinho (Configuração de Triggers).

### Fase 5: Analytics & Onboarding
- [x] Dashboards Gráficos (Recharts).
- [x] Wizard de Criação de Loja.

---

## 🚨 4. Pontos de Atenção (Backend Alignment)
*Funcionalidades que dependem de correções no Backend:*
1.  **Cancelamento de Pedido**: ✅ Corrigido (Bug no `InventoryMovementEntity`).
2.  **Criação de Configuração**: ✅ Corrigido (Validação no `AdminConfigController`).
3.  **Multi-Tenancy**: ✅ Implementado `TenantFilter` para capturar header.
4.  **Categorias e Mídia**: ✅ Corrigido (`DELETE /categories` segura e Upload retornando ID string).
5.  **Sistema de Auditoria**: ✅ Implementado (Backend API e Serviços de Auditoria).
