---
name: api-security-enforcer
description: Use esta skill sempre que o usuário solicitar a criação, alteração ou auditoria de Endpoints (Controllers), integrações de API, fluxos de autenticação (JWT), autorização de rotas, ou manipulação de dados sensíveis no backend ou frontend.
---

# Objetivo
Garantir que toda comunicação de dados respeite os princípios de Zero Trust (Confiança Zero), prevenindo vulnerabilidades do OWASP Top 10 (especialmente IDOR, Injeção e Exposição de Dados Sensíveis).

# Instruções de Execução (Siga em ordem estrita)

1. **Proteção contra IDOR (Insecure Direct Object Reference):**
   - No Backend (Java): Nunca assuma que um ID recebido na requisição é válido apenas porque existe no banco. Se a rota for de escopo de cliente (ex: `/api/orders/{id}`), você DEVE injetar o contexto do usuário autenticado e verificar se o pedido pertence a ele antes de retornar os dados.
   - Aplique validações de "Ownership" (Pertencimento) diretamente na camada de `Service`, nunca confie apenas no `Controller`.
2. **Exposição Mínima de Dados (Blindagem de DTOs):**
   - É estritamente proibido retornar classes de Entidade (`*Entity.java`) diretamente nos Controllers.
   - Crie e utilize DTOs (`*Response.java`) que omitam campos sensíveis como senhas, hashes, chaves de API, tokens e IDs internos de infraestrutura.
3. **Validação Estrita de Entrada (Sanitização):**
   - Em Java: Todo Payload de entrada (`*Request.java`) deve conter anotações de validação (`@NotBlank`, `@NotNull`, `@Size`, `@Email`). Respeite o `GlobalExceptionHandler` para retornar erros 400 formatados.
   - Em TypeScript (Frontend/Admin): Valide o input antes de enviar e garanta que o formato espelha perfeitamente o DTO esperado pelo Java.
4. **Rate Limiting e Abuso de Rotas:**
   - Rotas públicas de alto risco (Login, Reset de Senha, Criação de Conta, Webhooks de Pagamento) devem ser explicitamente protegidas por limite de requisições. Se for criar um novo endpoint crítico, lembre-se de integrá-lo ao `RateLimitFilter` ou mecanismo equivalente existente no projeto.
5. **Tratamento de Autenticação (Frontend/Admin):**
   - Nunca insira lógica de armazenamento de JWT de forma "hardcoded" ou solta em componentes. Utilize os serviços de interceptor de API (`src/api/axios.ts` ou `api.ts`) para anexar o `Bearer Token`.
   - Se receber um status `401 Unauthorized` ou `403 Forbidden`, o fluxo deve redirecionar para login de forma limpa e apagar tokens expirados.