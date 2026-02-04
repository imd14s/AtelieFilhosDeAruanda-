# Status do Projeto — Backend E-commerce (Ateliê Filhos de Aruanda)

**Última atualização:** 2026-02-04  
**Objetivo:** Checklist, memória e notas para situar a equipe e guiar próximos passos.

---

## 1. Visão geral

| Item | Detalhe |
|------|--------|
| **Projeto** | ecommerce-core (API REST) |
| **Stack** | Java 21, Spring Boot 3.2.1, Spring Security (JWT), JPA, PostgreSQL, Flyway |
| **Estrutura** | Camadas: API → Application → Domain → Infrastructure |
| **Autenticação** | JWT stateless; `/api/admin/**` exige `ROLE_ADMIN` |

### Principais áreas funcionais
- **Auth:** login/registro, JWT, bootstrap de admin via `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- **Catálogo:** produtos, categorias, variantes, imagens, integração (ML), AI
- **Pedidos:** criação, aprovação/cancelamento, webhook Mercado Pago
- **Pagamento:** serviço de pagamento com drivers (ex.: Mercado Pago)
- **Envio:** shipping com regras de roteamento (Service Engine)
- **Estoque:** movimentações por variante, alertas de estoque baixo
- **Mídia:** upload (MediaStorageService), assets públicos
- **Dashboard:** summary (produtos, vendas, pedidos pendentes, alertas), status de automação (N8n)
- **Admin:** regras, provedores, config, cache, feature flags, pedidos

---

## 2. Checklist de status

### 2.1 Segurança (baseado em auditoria 2026-02-04)

- [x] Path traversal no upload de imagem corrigido (ProductController delega a MediaStorageService)
- [x] Upload com validação de tipo/tamanho (MIME + MAX_UPLOAD_MB via MediaStorageService)
- [x] Path de upload via env (UPLOAD_DIR) — usado pelo MediaStorageService
- [x] Webhook com comparação de token em tempo constante (MessageDigest.isEqual)
- [x] JWT sem default para JWT_SECRET e JWT_EXPIRATION_MS
- [ ] **Pendente:** Validar tamanho mínimo do JWT_SECRET (≥ 32 bytes para HS256) no TokenProvider
- [ ] **Pendente:** Revisar default de ADMIN_EMAIL em produção (evitar admin@atelie.com fixo)
- [ ] **Pendente:** Garantir em prod que UPLOAD_DIR e mapeamento estático `/uploads` apontem para o mesmo diretório

### 2.2 Dados e funções reais (nada fake em produção)

- [x] Dashboard summary usa dados reais (OrderRepository.sumTotalSales, countPendingOrders, ProductRepository.findCriticalStock)
- [x] Status de automação usa N8nService.isAutomationEnabled()
- [x] Upload de imagem de produto centralizado em MediaStorageService

### 2.3 Código e débito técnico

- [x] Upload de imagem unificado (ProductController → MediaStorageService)
- [ ] **Pendente:** Extrair lógica de reflexão duplicada (MediaStorageService + PaymentService) para util compartilhado (ex.: ReflectionPropertyUtils)
- [ ] **Pendente:** Unificar ou renomear as duas interfaces OrderRepository (domain vs infrastructure)
- [ ] **Pendente:** Mover lógica de update de produto do ProductController para ProductService (TODO confirmado no código: `src/main/java/com/atelie/ecommerce/api/catalog/product/ProductController.java`)

### 2.4 Infra e ambiente

- [ ] Definir/documentar variáveis de ambiente obrigatórias (JWT_SECRET, JWT_EXPIRATION_MS, WEBHOOK_SECRET, UPLOAD_DIR, MAX_UPLOAD_MB, ALLOWED_IMAGE_MIME, ADMIN_PASSWORD, CORS_ALLOWED_ORIGINS).
- [ ] Garantir que CORS (CORS_ALLOWED_ORIGINS / CORS_ALLOWED_ORIGIN_PATTERNS) esteja configurado para prod
- [ ] Flyway: migrations aplicadas e sem conflito (V1, V2, V3, V4 presentes)

### 2.5 Testes e qualidade

- [ ] **CRÍTICO:** Diretório `src/test` NÃO EXISTE. Cobertura atual: 0%. Prioridade máxima para evitar regressões.
- [ ] Nenhum secret ou URL sensível em repositório (apenas env)

---

## 3. Memória e notas

### Decisões técnicas
- **Service Engine:** Roteamento de serviços (pagamento, envio) por regras (SpEL) e provedores; config por ambiente; drivers plugáveis.
- **Mídia:** Um único ponto de upload seguro (MediaStorageService) com validação; nome de arquivo = UUID + extensão (sem path no nome).
- **Dashboard:** Sempre dados reais; automação lida via N8nService (config dinâmica).
- **Usuários e admin:** O projeto tem inicialmente apenas 1 usuário — o ADMIN. E-mail e senha do admin vêm **somente** de variáveis de ambiente: `ADMIN_EMAIL` e `ADMIN_PASSWORD` (sem defaults em produção). Todos os demais usuários só podem ser criados por um admin (POST `/api/auth/register` exige JWT com ROLE_ADMIN). Quem define se um usuário é admin é somente outro admin (campo opcional `role` no registro, aceito apenas quando o chamador é admin).

### Pontos de atenção
- Existem duas interfaces `OrderRepository` (domain e infrastructure); a aplicação usa a de infrastructure (sumTotalSales, countPendingOrders). Evitar import errado.
- ProductController.update ainda está no controller; ideal mover para ProductService.
- Admin bootstrap: se ADMIN_PASSWORD estiver vazio, o bootstrap é pulado (comportamento intencional).

### Referência de auditoria
- Relatório completo de segurança, código duplicado e funções fake: **[SECURITY_AND_CODE_AUDIT.md](./SECURITY_AND_CODE_AUDIT.md)**.

---

## 4. Próximos passos sugeridos

### Curto prazo (P1)
1. Validar tamanho do JWT_SECRET no TokenProvider (falhar no init se &lt; 32 bytes).
2. Documentar no README ou em `.env.example` todas as variáveis de ambiente necessárias.
3. Em produção, alinhar UPLOAD_DIR com o path servido em `/uploads` (ou documentar a convenção).

### Médio prazo (P2)
4. Extrair ReflectionPropertyUtils (ou BeanReflectionHelper) e refatorar MediaStorageService + PaymentService.
5. Unificar/renomear OrderRepository (domain vs infrastructure) para evitar confusão de camadas.
6. Mover lógica de update de produto para ProductService.

### Quando necessário
7. Revisar default de ADMIN_EMAIL (ex.: usar apenas em perfil `dev`).
8. Aumentar cobertura de testes e adicionar testes de segurança (upload, auth, webhook).

---

## 5. Como usar este arquivo

- **Checklist:** Marque `[x]` nos itens concluídos e deixe `[ ]` nos pendentes.
- **Memória:** Use a seção 3 para anotar decisões, armadilhas e referências.
- **Próximos passos:** Atualize a seção 4 conforme prioridades mudarem; pode adicionar datas ou responsáveis.
- **Atualização:** Ao concluir um item, marque no checklist e, se fizer sentido, registre em “Memória e notas” ou no relatório de auditoria.

---

*Documento vivo: atualize sempre que o status do projeto ou as prioridades mudarem.*
