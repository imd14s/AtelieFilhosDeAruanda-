# Metodologia de Desenvolvimento - Ateliê Filhos de Aruanda

Este projeto segue uma metodologia de desenvolvimento rigorosa e profissional, focada em rastreabilidade, qualidade visual e alinhamento técnico entre Frontend e Backend.

## 1. Ciclo de Trabalho (Phase-Based)

Toda tarefa complexa deve seguir o ciclo:
1.  **PLANNING**: Pesquisa inicial, análise de impactos e criação do `implementation_plan.md`.
2.  **EXECUTION**: Desenvolvimento do código seguindo padrões de design moderno e CLEAN code.
3.  **VERIFICATION**: Testes visuais via browser subagent e geração de evidências (screenshots/vídeos).
4.  **WALKTHROUGH**: Documentação final dos resultados para o usuário.

## 2. Princípios de Frontend (Dashboard Admin)

-   **Zero Hardcode**: Configurações dinâmicas via JSONB. O frontend deve ser um reflexo do que o backend provê.
-   **Aesthetics WOW**: Uso intensivo de `lucide-react`, transições suaves, sombras suaves e tipografia moderna.
-   **Segurança**: Dados sensíveis (Tokens, Secrets) devem ser mascarados e nunca exibidos em texto aberto.
-   **Modularidade**: Componentes complexos (ex: formulários de gateways) devem ser isolados em pastas de componentes.

## 3. Comunicação Backend-Frontend

-   **Discrepancy Reporting**: Qualquer erro de arquitetura encontrado no backend durante o desenvolvimento do frontend deve ser documentado no arquivo `backend/communication_store.md`.
-   **Service Engine**: Utilização da arquitetura de Provedores e Configurações Dinâmicas para Frete e Pagamento.

## 4. Gestão de Tarefas

-   O progresso é rastreado via `task.md` no diretório de cérebro do projeto, garantindo que nenhum requisito seja esquecido.
