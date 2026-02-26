---
name: frontend-architecture-guard
description: Use esta skill sempre que o usuário solicitar a criação de um novo módulo inteiro, nova funcionalidade complexa, ou reestruturação de pastas no frontend ou dashboard-admin.
---

# Objetivo
Garantir a Separação de Responsabilidades (Separation of Concerns) no ecosistema React. Prevenir "Spaghetti Code" mantendo a UI estritamente separada da lógica de dados e de chamadas de rede.

# Instruções de Execução (Ordem Arquitetural Obrigatória)

1. **Validação de Contrato (Types):** Antes de criar qualquer tela, defina as Interfaces/Types em `src/types/`. O Frontend deve espelhar os DTOs exatos que o Backend Java fornecerá.
2. **Isolamento de Rede (Services):** É EXPRESSAMENTE PROIBIDO realizar chamadas HTTP (`axios`, `fetch`) diretamente dentro de arquivos da pasta `src/components/` ou `src/pages/`. Toda comunicação externa OBRIGATORIAMENTE deve ser encapsulada em funções assíncronas dentro de `src/services/`.
3. **Padrão Smart/Dumb Components:**
   - **Dumb (Componentes Visuais):** Arquivos em `src/components/` devem apenas receber `props` e emitir eventos (`onClick`, `onChange`). Eles não devem possuir regras de negócio complexas ou saber de onde os dados vêm.
   - **Smart (Páginas e Hooks):** Arquivos em `src/pages/` e custom hooks (`src/hooks/`) são os maestros. Eles chamam os `services`, gerenciam o estado (ex: `useState`, `useReducer`) e passam os dados limpos para os componentes visuais.
4. **Gerenciamento de Estado Global:** Utilize a pasta `src/context/` apenas para estados que realmente precisam ser globais (ex: Autenticação, Tema, Carrinho). Não polua o Context API com estados efêmeros de formulários ou modais isolados.
5. **Comunicação com o Mapa:** Sempre valide suas ações com as diretrizes do arquivo `/docs-ai/MAP_FRONTEND.md` ou `/docs-ai/MAP_DASHBOARD.md` antes de finalizar.