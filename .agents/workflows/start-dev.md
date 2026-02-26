---
description: 
---

Atue como um Engenheiro DevOps e Desenvolvedor Full-Cycle Sênior. Sua tarefa é garantir que todo o ecossistema do projeto suba e fique estável no meu ambiente local.

Por favor, execute o script `./start-dev.sh` na raiz do projeto e atue de forma autônoma seguindo estas diretrizes:

1. MONITORAMENTO ATIVO: Acompanhe os logs dos terminais (Spring Boot/Maven, React Dashboard e React Store). 
2. RESOLUÇÃO DE ERROS (AUTO-HEALING): Se a aplicação falhar ao iniciar devido a:
   - Erros de compilação do Maven ou falhas em testes;
   - Erros de inicialização do Spring (ex: "Could not resolve placeholder", falha de injeção de dependência, problemas no Flyway);
   - Portas travadas ("Address already in use");
   - Falha de conexão com o banco de dados Docker.
   Você tem PERMISSÃO EXPLÍCITA para analisar o stack trace, ler os arquivos correspondentes, fazer as modificações necessárias no código ou nos arquivos `.yml/.env` para corrigir o problema e reexecutar o script.
3. CRITÉRIO DE SUCESSO: O fluxo só é considerado concluído quando a API (porta 8080), o banco de dados (5432), o Dashboard (3000) e a Loja (5173) estiverem rodando simultaneamente sem crashear.
4. RELATÓRIO: Ao final, faça um breve resumo apontando quais erros você encontrou no caminho e como os corrigiu.