---
name: ts-migration
description: Use esta skill sempre que o usuário solicitar a migração, tipagem ou conversão de arquivos JavaScript (.js/.jsx) para TypeScript (.ts/.tsx) no frontend da aplicação.
---

# Objetivo
Garantir uma migração cirúrgica do frontend JavaScript para TypeScript Estrito, respeitando os contratos de DTOs do backend e a componentização do React.

# Instruções de Execução (Siga em ordem)
1. Inicie lendo as diretrizes de pastas em `/docs-ai/MAP_FRONTEND.md`.
2. Verifique de onde vêm os dados (services/API). Se o arquivo envolver comunicação externa, você DEVE criar a interface correspondente na pasta `src/types/` primeiro.
3. Tipagem estrita: Não utilize o tipo `any`. Se o dado for dinâmico ou desconhecido, use `unknown` e faça *type narrowing*. Interfaces genéricas para Props de UI devem ser explícitas.
4. Modifique a extensão: Renomeie o arquivo alvo para `.tsx` (se renderizar UI/JSX) ou `.ts` (se for apenas lógica/serviço).
5. Validação: Após a alteração, execute de forma autônoma o linter e o comando de type-check do TypeScript no terminal para garantir que a refatoração não quebrou dependências correlatas.