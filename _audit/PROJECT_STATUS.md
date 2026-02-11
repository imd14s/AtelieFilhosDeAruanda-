# Status do Projeto — Ateliê Filhos de Aruanda

**Última atualização:** 2026-02-10
**Objetivo:** Centralizar o status das funcionalidades, débitos técnicos e roadmap.

---

## 1. Estado Atual: Fase 8 (Marketing & Expansão) 🔄

Concluímos a refatoração técnica de infraestrutura e a expansão das ferramentas de marketing.

### ✅ Avanços Recentes (Concluídos)
- **Centralização de Reflection**: Criada a utilidade `ReflectionPropertyUtils` e refatorados `MediaStorageService` e `PaymentService`.
- **Gestão de Cupons (Full CRUD)**: Implementado suporte completo para criação, listagem, edição e exclusão no Dashboard e Backend.
- **Carrinho Abandonado**: Integração finalizada no Dashboard para gestão de gatilhos e templates de email.
- **Padronização de Ambiente**: `.env.example` atualizado com todas as variáveis críticas (S3/Uploads, JWT, Webhooks).
- **Consistência de Dados**: Verificada a unificação do `OrderRepository` na camada de infraestrutura.

### ⚠️ Inconsistências & Bloqueios (Ações Necessárias)
- **Restart do Backend**: **OBRIGATÓRIO** para que as novas variáveis de ambiente e correções de `SecurityConfig` (erros 401) sejam aplicadas.
- **Validação de Uploads**: Testar o fluxo de imagem com a nova configuração de diretórios definida no `.env`.

---

## 2. Mapa de Funcionalidades (Real vs Doc)

### 2.1 Backend API (`/backend`)
- [x] **Auth**: Login, Registro, Verificação de Token.
- [x] **Catálogo**: CRUD de Produtos, Categorias e Variantes.
- [x] **Marketing**: Cupons (CRUD Completo) e Carrinho Abandonado.
- [x] **Gestão de Equipe**: CRUD completo em `/api/admin/users`.
- [x] **Common Utils**: Abstração de Reflection e tratamento de propriedades dinâmicas.

### 2.2 Dashboard Admin (`/dashboard-admin`)
- [x] **Produtos**: Listagem e edição (UUID based).
- [x] **Equipe**: Gestão completa funcional.
- [x] **Marketing**: Dashboard funcional para Cupons e Carrinho Abandonado.

---

## 3. Débitos Técnicos & Pendências (Backlog)

### Alta Prioridade (P1)
- [ ] **Garantir Restart**: Validar se alterações no `SecurityConfig.java` foram carregadas no container.
- [ ] **Teste de Fluxo de Caixa**: Validar cálculo de descontos (cupons) no checkout do storefront.

### Média Prioridade (P2)
- [ ] **ProductService**: Mover lógica de update remanescente do `ProductController` para o `ProductService` (Confirmado em Service, mas Controller ainda possui mapeamento manual).
- [ ] **Auditoria de Logs**: Implementar logging estruturado para operações críticas de marketing.

---

## 4. Próximos Passos
1. Reiniciar ambiente Docker para validar correções de 401.
2. Executar teste E2E de compra usando um cupom de desconto editado.
3. Finalizar documentação de API para os novos endpoints de Cupons no `ROTAS_AND_REQUEST.md`.
