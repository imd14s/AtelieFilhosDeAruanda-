# Diretrizes de Desenvolvimento e Fluxo de Trabalho

Este documento formaliza as regras de negócio e desenvolvimento técnico do projeto **Dashboard Admin**, especialmente no que tange à comunicação entre equipes (Frontend vs Backend).

## 1. Regra de Integração Frontend-Backend

**Princípio Fundamental:** O Frontend deve ser implementado de forma "Realista", assumindo que a API ideal existe. Não devemos usar mocks (dados falsos fixos) se pudermos definir um contrato de API claro.

### Fluxo de Trabalho ("Frontend First")

1.  **Implementação Realista**: O desenvolvedor Frontend cria as telas e serviços chamando os endpoints REST que *fariam sentido* para a funcionalidade (ex: `GET /api/settings/shipping`).
2.  **Tratamento de Falhas**: O Frontend deve tratar o erro `404` ou `500` (caso a API não exista) de forma graciosa, mostrando mensagens como "Serviço indisponível" ao invés de quebrar a tela.
3.  **Documentação de Hand-off**:
    - **Sempre que o Frontend implementar uma funcionalidade para a qual a API ainda não está pronta**, é OBRIGATÓRIO criar/atualizar documentação para o time de Backend.
    - **Local do Arquivo**: `~/workspace/AtelieFilhosDeAruanda-/backend/frontend_integration_specs.md` (ou arquivos específicos na pasta `backend/`).
    - **Conteúdo Obrigatório**:
        - Rota esperada (ex: `POST /api/products`).
        - Payload JSON enviado pelo Frontend.
        - Resposta JSON esperada (Status Code e Corpo).
        - Regras de validação assumidas.

## 2. Inclusão de Novas Funcionalidades

Ao planejar novas funcionalidades (Fases do Projeto):

1.  **Atualizar Status**: Manter `docs/project_status.md` atualizado.
2.  **Planejamento**: Criar um arquivo Markdown temporário (Artifact) com o plano antes de codar.
3.  **Execução**:
    - Tipagem (TypeScript) primeiro.
    - Serviços (Axios) depois.
    - UI (Componentes/Páginas) por último.

## 3. Padrões de Código

- **Serviços**: Nunca chamar `api.get` direto nos componentes. Sempre encapsular em `src/services/NomeService.ts`.
- **Tipagem**: Interfaces em `src/types/` devem ser fiéis aos DTOs esperados.
- **Multitenancy**: Sempre considerar que o `X-Tenant-ID` é necessário para operações de dados.

---
*Este documento serve como "Memória Local" para garantir que qualquer desenvolvedor ou agente siga o mesmo padrão de qualidade e comunicação.*
