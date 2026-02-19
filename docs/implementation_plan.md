# Planejamento de Implementação: Dashboard Admin v2.0

Este documento detalha o roteiro para transformar o Dashboard Admin atual em uma plataforma Multi-loja completa, conforme os requisitos listados.

## 📅 Roadmap de Fases

### Fase 1: Fundação Multi-Tenancy e Segurança (Requisitos 1, 2, 12)
**Objetivo:** Permitir gestão de múltiplas lojas e garantir segurança.
- [ ] **Arquitetura de Tenant**: Implementar seletor de loja (Contexto Global).
- [ ] **Gestão de Lojas**: CRUD de lojas (Criar, Editar, Pausar).
- [ ] **Gestão de Acessos (ACL)**: Perfis (Master, Admin Loja, Equipe) e permissões granulares.
- [ ] **Auditoria**: Tela de Logs de ações.

### Fase 2: Catálogo Avançado e Mídia (Requisitos 3, 4)
**Objetivo:** Flexibilidade total no cadastro de produtos.
- [ ] **Editor de Produtos Completo**: 
    - Variantes (formato Mercado Livre/Shopify).
    - SEO, Dimensões, Tags.
- [ ] **Gerenciador de Mídia (IAM)**:
    - Galeria isolada por loja.
    - Upload múltiplo e reordenação.
- [ ] **Editor AI**: Interface para "Remover fundo", "Mockup". (Mock da API por enquanto).

### Fase 3: Operações e Configurações (Requisitos 5, 6, 11)
**Objetivo:** Configuração de vendas e checkout.
- [ ] **Módulo de Frete**: UI para ativar/desativar provedores e regras.
- [ ] **Módulo de Pagamento**: UI para credenciais e taxas.
- [ ] **Configurações Gerais**: Toggles globais de features.

### Fase 4: Marketing e Engajamento (Requisitos 7, 8)
**Objetivo:** Ferramentas de venda.
- [ ] **Cupons**: CRUD avançado com regras.
- [ ] **Carrinho Abandonado**: Editor de templates de e-mail e regras de disparo.
- [ ] **Login Social & News**: Configuração dos providers.

### Fase 5: Analytics e Onboarding (Requisitos 9, 10)
**Objetivo:** Visibilidade e facilidade de entrada.
- [ ] **Dashboards Gráficos**: Integração com lib de charts (Recharts/ApexCharts).
- [ ] **Wizard de Onboarding**: Passo a passo para novas lojas (Setup guiado).

---

## 🛠 Detalhamento Técnico (Frontend)

### Novos Serviços (`src/services/`)
- `TenantService`: Gestão de lojas.
- `MediaService`: Upload e manipulação IA.
- `ShippingService` / `PaymentService`: Configurações de integração.
- `MarketingService`: Cupons e Campanhas.
- `AnalyticsService`: Dados agregados.

### Novas Rotas (`src/routes.tsx`)
```tsx
/admin/tenants (Super Admin)
/:tenantId/dashboard
/:tenantId/catalog/products
/:tenantId/catalog/media-editor
/:tenantId/settings/shipping
/:tenantId/settings/payments
/:tenantId/marketing/coupons
/:tenantId/analytics
```

### Componentes Chave (`src/components/`)
- `TenantSelector`: Dropdown no header para troca rápida.
- `MediaGallery`: Grid com drag-and-drop.
- `FeatureToggle`: Switch com feedback visual para ativar módulos.
- `RichTextEditor`: Para descrições e e-mails.

## ⚠️ Dependências Críticas do Backend
- [x] Backend suporta validação de Multi-tenant (Header `X-Tenant-ID`).
- [x] Endpoints críticos (Cancelamento, Config, Categoria) corrigidos.
- [ ] Implementação de Isolamento de Dados (Discriminator/Schema) pendente.
