---
name: dynamic-config-guard
description: Use esta skill sempre que o usuário solicitar a integração com APIs externas (pagamento, frete, IA), criação de regras de negócio parametrizáveis, ou adição de novas variáveis de ambiente (.env).
---

# Objetivo
Garantir a escalabilidade operacional "Zero-Deploy". Toda a lógica de negócio, credenciais de terceiros e parâmetros operacionais devem ser abstraídos e gerenciados pelo usuário via Dashboard (Banco de Dados), nunca chumbados no código ou em arquivos de ambiente.

# Instruções de Execução (Siga rigorosamente)

1. **A Lei do `.env` (Restrição de Infraestrutura):**
   - O arquivo `.env` (ou `application.yml` fixo) SÓ PODE conter configurações imutáveis de infraestrutura raiz. Exemplo: Conexão com o Banco de Dados, Host do Redis, Porta do Servidor e Segredos de JWT da aplicação.
   - É EXPRESSAMENTE PROIBIDO adicionar chaves de API (ex: Stripe, Mercado Pago, OpenAI, MelhorEnvio) ou parâmetros de negócio no `.env`.

2. **Configuração Dinâmica via Banco de Dados (Backend):**
   - Sempre que integrar um serviço externo, as chaves (API Keys, Tokens, Webhook Secrets) devem ser buscadas dinamicamente no banco de dados.
   - Utilize as tabelas e serviços já existentes (como `SystemConfig`, `ServiceProviderConfig`, ou `DynamicConfigService`) para recuperar esses dados em tempo de execução.

3. **Abstração de UI (Dashboard Admin):**
   - Se você criar um serviço no Backend que exige uma configuração nova, você DEVE prever e listar a necessidade de criar a interface correspondente no `dashboard-admin` para que o administrador possa inserir/editar esse dado. O usuário nunca deve precisar mexer em código para ligar ou desligar uma feature.

4. **Tratamento de Fallback (Segurança):**
   - Se um serviço tentar rodar, mas a configuração dinâmica não estiver preenchida no banco de dados, lance uma exceção de negócio clara (ex: `MissingConfigException` ou erro 400 descritivo) informando: *"A configuração X não foi definida no painel de controle"*. Nunca deixe a aplicação estourar um `NullPointerException`.

5. **REGRA DE CONTENÇÃO (Segurança de Frontend):**
   - O Frontend (loja) NUNCA deve receber chaves de API sensíveis do banco de dados para fazer requisições diretas a terceiros. O Frontend chama o seu Backend, o Backend lê a chave do Banco e faz a chamada ao serviço externo de forma segura.