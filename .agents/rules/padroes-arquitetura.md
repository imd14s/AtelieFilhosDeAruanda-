---
trigger: always_on
---

# 🛡️ Leis de Engenharia e Qualidade do Ateliê Filhos de Aruanda

- **Diretiva Mestra:** VOCÊ DEVE consultar o arquivo `/docs-ai/MASTER_INDEX.md` silenciosamente antes de propor ou executar qualquer alteração de código.
- **Idioma:** SEMPRE SE COMUNIQUE EXCLUSIVAMENTE EM PT-BR.
- **Restrição Frontend (React/Vite + TypeScript):** Tolerância ZERO para o tipo genérico `any` ou comentários como `@ts-ignore`. O código deve ser rigorosamente tipado.
- **Validação Estrita do Frontend:** Após qualquer alteração no frontend, você é OBRIGADO a rodar a verificação de tipos (ex: `npm run typecheck` ou `tsc --noEmit`) e o linter. O código só é aceitável se passar com zero erros e zero warnings.
- **Restrição Backend (Java/Spring Boot):** Respeite a Clean Architecture estritamente. NUNCA importe ou acesse classes da camada de `infrastructure` dentro da `api`, `application` ou `domain`.
- **Validação Estrita do Backend:** Após qualquer alteração no backend, você é OBRIGADO a verificar a compilação rodando `mvn clean compile` e `mvn test` (para validar os testes de arquitetura) no terminal.
- **Protocolo de Auto-Correção (Build Guard):** NUNCA reporte uma tarefa como concluída sem rodar `pre-push.sh` se houver erros de compilação, tipagem ou linter. Se os comandos de validação falharem no seu terminal, inicie um loop de correção silencioso e conserte os erros de forma autônoma. Só me devolva a resposta quando todo o ecossistema estiver compilando perfeitamente.