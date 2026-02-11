# Fluxo de Trabalho do Projeto (Standard Workflow)

Este documento define a ordem de execução obrigatória para o desenvolvimento e correção de funcionalidades no projeto.

## Ciclo de Desenvolvimento (Loop)

### 1. Identificação e Correção (Fase 1)
- **Objetivo**: Criar testes, identificar problemas ou implementar correções.
- **Ações**:
    - Analisar falhas reportadas.
    - Criar testes (unitários/integração) para reproduzir o erro.
    - Implementar a correção no código.

### 2. Execução de Testes (Fase 2)
- **Objetivo**: Validar a correção via testes automatizados.
- **Ações**:
    - Rodar testes de backend (`mvn test`).
    - Rodar testes de frontend/admin se houver.

### 3. Build e Deploy Local (Fase 3)
- **Objetivo**: Subir a aplicação completa para validação integrada.
- **Ações**:
    - Utilizar Docker Compose: `docker-compose up --build`.
    - Garantir que todos os serviços (Backend, Frontend, Banco) estejam operacionais.

### 4. Verificação Visual (Fase 4)
- **Objetivo**: Busca ativa por falhas visuais e erros de integração.
- **Ações**:
    - Navegar pela aplicação (Storefront e Admin).
    - Verificar fluxos críticos (Login, Checkout, CRUD).
- **Relatório**:
    - Atualizar arquivo: `RELATORIO_TESTE_VISUAL.md`.
    - **Regra**: Reportar *apenas* as FALHAS (com detalhes) e listar os ACERTOS (funcionalidades ok).
    - Nessa fase é proibido correção apenas relatar as falhas.

### 5. Retorno ao Início (Fase 5)
- **Objetivo**: Identificar novos erros ou confirmar resolução.
- **Ações**:
    - Se houver falhas: Voltar para **Fase 1**.
    - Se tudo ok: Finalizar tarefa.
    - **Reporte**: Informar ao usuário o estado atual e o plano para a próxima iteração.
