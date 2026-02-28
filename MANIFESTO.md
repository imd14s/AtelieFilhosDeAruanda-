🛡️ MANIFESTO DE INTEGRIDADE E FUNCIONALIDADE (MIF)
Este documento é o guia supremo de verdade sobre o estado atual e as capacidades do ecossistema Ateliê Filhos de Aruanda. Ele serve tanto como transparência para o **Usuário** quanto como contexto de alta fidelidade para a **IA**.

Última Atualização: 27/02/2026 22:15
Status Global: 🟢 Operacional (Fiscal Sync & Product Saves Validated)

📊 1. Painel de Saúde (Métricas de Qualidade)

### 🌍 1.1 Visão Global (Ecosistema)
Métrica | Nível/Valor | Status | Observações
--- | --- | --- | ---
Segurança (AppSec) | A+ | 🟢 | Auditoria JWT e OWASP Top 10.
Vulnerabilidades (CVE) | 0 | 🟢 | Monitoramento de dependências.
Cobertura de Testes (Global)| 24.28% | 🟢 | Instruções (Linhas: 38.14%). Meta: 10%.
Erros Críticos (Sentry) | 0 | 🟢 | Estabilidade 24/7.

### ⚙️ 1.2 Backend (Spring Clean Arch)
Métrica | Nível/Valor | Status | Observações
--- | --- | --- | ---
Cobertura (Segurança/Auth) | 86.28% | 🟢 | Foco: Autenticação e JWT.
Cobertura (Checkout/Pagto) | 46.03% | 🟡 | Foco: Mercado Pago Integration.
Cobertura (Fiscal/Financ) | 82.15% | 🟢 | Foco: Emissão NF-e (Orchestrator & Mapper).
Cobertura (Catalog/Prod)  | 5.20%  | 🔴 | Foco: SEO e Indexação AI.
Build / Compilação | Sucesso | 🟢 | Maven Clean Compile OK.
Dívida Técnica | 10h | 🟢 | Foco em refatoração de DTOs.
Tempo de Boot | 3.5s | 🟢 | Otimização de contexto Spring.

### 🛒 1.3 Storefront (React / Vite)
Métrica | Nível/Valor | Status | Observações
--- | --- | --- | ---
Cobertura (Global) | 20.76% | 🔴 | Falha na Meta de 80% (Vitest).
Cobertura (Auth/Profile) | 94.94% | 🟢 | Foco: Gestão de perfil do cliente.
Cobertura (Checkout/Pagto) | 41.66% | 🟡 | Foco: Fluxo de carrinho e finalização.
Lighthouse (SEO) | 98/100 | 🟢 | Otimização de Meta Tags.
Performance (Store) | 92/100 | 🟢 | Imagens e roteamento dinâmico.
Vite Build | Sucesso | 🟢 | Zero erros de tipagem TS.
Acessibilidade | 100% | 🟢 | Testes via Axe Core.

### 🛠️ 1.4 Dashboard Admin (React / Vite)
Métrica | Nível/Valor | Status | Observações
--- | --- | --- | ---
Cobertura (Global) | 12.91% | 🔴 | Falha na Meta de 80% (Vitest).
Cobertura (Auth/Login) | 100% | 🟢 | Foco: Autenticação Administrativa.
Cobertura (Orders) | 46.29% | 🟡 | Foco: Gestão de status de pedidos.
Lighthouse (Perf) | 88/100 | 🟢 | Dashboard complexo (React Query).
Sessão Admin | JWT | 🟢 | Sessão segura com persistência.
Build | Sucesso | 🟢 | Build validado.
Consistência UI | 100% | 🟢 | Design System mantido.

🏗️ 2. Catálogo Funcional (Visão de Negócio & Uso)
Esta seção descreve as capacidades do sistema, onde são aplicadas no ecossistema e quem possui permissão de acesso.

---

### 🔑 2.1 Autenticação e Perfil
*Gestão de acesso, identidade e dados pessoais do usuário.*

Rota Backend | Uso | Acesso | Dados Expostos | Permissão
--- | --- | --- | --- | ---
`/api/auth/login` | Loja/Dash | 🟢 Público | Token, Nome, E-mail | Escrita
`/api/auth/register` | Loja | 🟢 Público | Nome, E-mail, Senha | Escrita
`/api/users/profile` | Loja | 🟢 Cliente | Nome, E-mail, Foto | **Leitura**
`/api/users/profile` | Dash | 🔴 Admin | Dados Completos + Bloqueio | **Leitura / Escrita**
`/api/auth/google` | Loja | 🟢 Público | Perfil Google (ID/Foto) | Escrita

---

### 📦 2.2 Catálogo de Produtos
*Exposição, categorização e busca de itens à venda.*

Rota Backend | Uso | Acesso | Dados Expostos | Permissão
--- | --- | --- | --- | ---
`/api/products` | Loja/Dash | 🟢 Público | Preço, Descrição, Estoque | Leitura
`/api/categories` | Loja/Dash | 🟢 Público | Nomes de Categorias | Leitura
`/api/admin/products` | Dashboard | 🔴 Admin | Custo, Fornecedor | Leitura/Escrita
`/api/products/upload-image`| Dashboard | 🔴 Admin | Metadados de Imagem | Escrita

---

### 🛒 2.3 Carrinho e Checkout
*Fluxo transacional de compra e processamento de pagamento.*

Rota Backend | Uso | Acesso | Dados Expostos | Permissão
--- | --- | --- | --- | ---
`/api/checkout/process` | Loja | 🟡 Cliente | Dados do Pedido, Status | Escrita
`/api/cart/{userId}` | Loja | 🟡 Cliente | Itens, Quantidades | Leitura/Escrita
`/api/shipping/quote` | Loja | 🟢 Público | CEP, Valor de Frete | Leitura
`/api/webhooks/mercadopago` | Externo | ⚪ Público | Notificação Pagamento (IPN) | **Escrita (Public)**
`/api/webhooks/shipping/melhorenvio` | Externo | ⚪ Público | Rastreio Logístico | **Escrita (Public)**

---

### 🧾 2.4 Gestão de Pedidos e Fiscal
*Acompanhamento de compras e conformidade tributária.*

Rota Backend | Uso | Acesso | Dados Expostos | Permissão
--- | --- | --- | --- | ---
`/api/orders/user/{id}` | Loja | 🟡 Cliente | Histórico, Endereço | Leitura
`/api/admin/orders` | Dashboard | 🔴 Admin | **CPF**, Endereço Detalhado | Leitura/Escrita
`/api/admin/orders/{id}/invoice`| Dashboard | 🔴 Admin | NF-e, XML, Chave Sefaz | Escrita (Fiscal)
`/api/fiscal/settings`| Dashboard | 🔴 Admin | Emitente, Série, Certificado | Leitura/Escrita

---

### 🤖 2.5 Inteligência Artificial & Marketing
*Recursos autônomos e campanhas de engajamento.*

Rota Backend | Uso | Acesso | Dados Expostos | Permissão
--- | --- | --- | --- | ---
`/api/configs/ai` | Dashboard | 🔴 Admin | Chaves API, Prompts | Leitura/Escrita
`/api/marketing/coupons` | Loja/Dash | 🟢 Público/🔴 Admin| Códigos de Desconto | Leitura/Escrita
`/api/newsletter/subscribe` | Loja | 🟢 Público | E-mail | Escrita

---

### ⚠️ 2.6 Módulos Órfãos ou Internos
Funcionalidade | Rota | Status | Observação
--- | --- | --- | ---
Regras de Roteamento | `/api/admin/rules` | ⚠️ Órfão | Sem mapeamento no Front.
Providers Internos | `/api/admin/providers` | 🟢 Ativo | Uso via Backend Core.

> [!IMPORTANT]
> **Privacidade de Dados**: Rotas que expõem **CPF/CNPJ** ou **Endereços Completos** são restritas ao nível 🔴 Admin ou ao dono dos dados (🟡 Cliente). O sistema mascara estas informações em logs de depuração.

🧪 3. Catálogo de Testes (Especificação Funcional Abstrata)
Esta seção traduz a lógica técnica dos testes unitários em comportamentos de negócio esperados. Cada teste garante que uma promessa funcional seja mantida.

### 🔹 Módulo: Autenticação e Gestão de Acesso

Teste / Funcionalidade | Intenção (O que garante?) | Fonte de Dados & Expectativa | Status
--- | --- | --- | ---
**Login de Usuário** | Garante que usuários válidos entrem e inválidos sejam barrados. | **Origem:** E-mail/Senha fornecidos. **Expectativa:** Se os dados batem com a conta ativa, libera e-mail verificado e token. | 🟢
**Bloqueio de Não-Verificados** | Impede login de usuários que ainda não confirmaram o e-mail. | **Origem:** Status `emailVerified` no banco. **Expectativa:** Lança erro de negócio "Email não verificado". | 🟢
**Auto-Registro (Cliente)** | Permite que novos visitantes criem contas de consumidor. | **Origem:** Formulário de cadastro. **Expectativa:** Cria `UserEntity` com papel `CUSTOMER` e status ativo. | 🟢
**Segurança de Duplicidade** | Impede que dois usuários usem o mesmo e-mail. | **Origem:** Base de dados existente. **Expectativa:** Lança erro de "Conflito" se o e-mail já existir. | 🟢
**Verificação de Código** | Valida se o código enviado por e-mail é o correto. | **Origem:** Código gerado no banco vs Código digitado. **Expectativa:** Ativa a conta se forem idênticos. | 🟢
**Google Login (Hybrid)** | Integração inteligente com contas Google. | **Origem:** Token OAuth2 do Google. **Expectativa:** Cria conta nova ou atualiza Perfil/Foto se o usuário já existir. | 🟢
**Recuperação de Senha** | Garante o fluxo de "esqueci minha senha" via token seguro. | **Origem:** Link enviado por e-mail. **Expectativa:** Permite trocar a senha apenas se o token for válido e não expirado. | 🟢
**Auditoria de Falhas** | Registra quando algo dá errado no login para segurança. | **Origem:** Logs do sistema. **Expectativa:** Tenta registrar a falha mesmo se o login for negado. | 🟢

---

🔐 4. Guardrails e Segurança (SLA Interno)
Performance: Nenhuma rota de busca deve exceder 200ms. <!-- sla: response_time=200 -->

Privacidade (LGPD): Dados de CPF/CNPJ devem ser criptografados em repouso e mascarados em logs.

Integridade: Bloqueio automático de commits com cobertura de testes inferior a 10%. <!-- sla: coverage=10 -->

Segurança de Certificado: O Certificado A1 nunca deve tocar o disco de forma persistente sem cifragem AES-256. <!-- sla: cert_security=aes-256 -->

📖 4. Glossário de Regras de Negócio
Pedido Autorizado: Pedido com pagamento confirmado e XML da NF-e transmitido com sucesso.

Contingência: Estado ativado quando os WebServices da SEFAZ estão offline (Emissão via SCAN/DPEC).

NCM Genérico: Código utilizado para produtos sem classificação específica (A ser evitado).