🛡️ MANIFESTO DE INTEGRIDADE E FUNCIONALIDADE (MIF)
Este documento é o guia supremo de verdade sobre o estado atual e as capacidades do ecossistema Ateliê Filhos de Aruanda. Ele serve tanto como transparência para o **Usuário** quanto como contexto de alta fidelidade para a **IA**.

Última Atualização: 27/02/2026 16:16
Status Global: 🟢 Operacional

📊 1. Painel de Saúde (Métricas de Qualidade)

<!-- START_METRICS_TABLE -->
Métrica | Nível/Valor | Status | Observações
--- | --- | --- | ---
Segurança (AppSec) | A+ | 🟢 | Baseado em OWASP Top 10 e auditoria JWT.
Erros de Lógica Críticos | 0 | 🟢 | Nenhuma regressão detectada em fluxos de Auth/Fiscal.
Vulnerabilidades (CVE) | 0 | 🟢 | Dependências auditadas.
Cobertura de Testes (AUTH) | 100% | 🟢 | Módulo de Autenticação com 100% de branches cobertas.
Cobertura de Testes (Global)| 12.5% | 🟡 | Em ascensão (Meta: 80%).
Dívida Técnica | 10h | 🟢 | Refatoração de código morto no AuthService concluída.
<!-- END_METRICS_TABLE -->

🏗️ 2. Catálogo Funcional (Visão de Negócio & Uso)
Esta seção descreve as capacidades do sistema, onde são aplicadas no ecossistema e quem possui permissão de acesso.

| Módulo de Negócio | Onde é Usado? | Acesso / Quem? | Status |
| --- | --- | --- | --- |
| **Autenticação e Perfil** | Loja e Dashboard | 🟢 Público / 🟡 Cliente / 🔴 Admin | Ativo |
| **Catálogo de Produtos** | Loja e Dashboard | 🟢 Público / 🔴 Administradores | Ativo |
| **Carrinho e Checkout** | Loja Virtual | 🟡 Clientes Logados | Ativo |
| **Gestão de Pedidos** | Loja e Dashboard | 🟡 Clientes / 🔴 Administradores | Ativo |
| **Marketing e Newsletter** | Loja e Dashboard | 🟢 Público / 🔴 Administradores | Ativo |
| **Configurações de IA** | Dashboard Admin | 🔴 Administradores | Ativo |
| **Relatórios e Analytics** | Dashboard Admin | 🔴 Administradores | Ativo |
| **Fiscal e Tributário** | Dashboard Admin | 🔴 Administradores | Ativo |
| **Logística e Frete** | Loja e Dashboard | 🟢 Público / 🔴 Administradores | Ativo |
| **Regras de Roteamento** | (Nenhum Front) | 🔴 Administradores | ⚠️ Órfão |
| **Gestão de Usuários** | Dashboard Admin | 🔴 Administradores | Ativo |

> [!NOTE]
> **Acesso Privado (🔴)** exige permissões de `ROLE_ADMIN`.
> **Acesso Autenticado (🟡)** exige que o usuário esteja logado (JWT).
> **Acesso Público (🟢)** funcionalidade disponível para visitantes anônimos.

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

Integridade: Bloqueio automático de commits com cobertura de testes inferior a 80%. <!-- sla: coverage=80 -->

Segurança de Certificado: O Certificado A1 nunca deve tocar o disco de forma persistente sem cifragem AES-256. <!-- sla: cert_security=aes-256 -->

📖 4. Glossário de Regras de Negócio
Pedido Autorizado: Pedido com pagamento confirmado e XML da NF-e transmitido com sucesso.

Contingência: Estado ativado quando os WebServices da SEFAZ estão offline (Emissão via SCAN/DPEC).

NCM Genérico: Código utilizado para produtos sem classificação específica (A ser evitado).