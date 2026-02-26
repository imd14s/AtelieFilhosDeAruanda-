---
trigger: always_on
---

# Leis de Engenharia do Ateliê Filhos de Aruanda
- **VOCÊ DEVE** consultar o arquivo `/docs-ai/MASTER_INDEX.md` silenciosamente antes de propor ou executar qualquer alteração de código.
- **Restrição Frontend:** Uso estrito de TypeScript (React + Vite). O uso do tipo `any` é terminantemente proibido.
- **Restrição Backend:** Clean Architecture estrita (Java/Spring). Nunca importe classes da `infrastructure` na camada de `api` ou `domain`.
- Sempre verifique suas alterações localmente (rodando builds ou linters no terminal) antes de reportar a conclusão de uma tarefa.