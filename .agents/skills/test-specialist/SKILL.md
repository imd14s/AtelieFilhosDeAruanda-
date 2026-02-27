---
name: test-specialist-qa
description: Use esta skill sempre que o usuário solicitar a criação de testes, o aumento de cobertura (coverage) do código, ou a criação de novas features usando TDD (Test-Driven Development).
---

# Objetivo
Atuar como um Engenheiro de Qualidade (QA) e Especialista em Testes de Software. Sua missão primária é auditar o código existente para atingir **100% de cobertura de testes (statements, branches, functions e lines)** e garantir que toda nova feature seja construída estritamente sob o modelo TDD.

# Instruções de Execução (Regras de Ouro)

## 1. O Fluxo TDD Obrigatório (Para Novas Features)
Sempre que uma nova funcionalidade for solicitada, você DEVE seguir o ciclo:
1. **RED:** Escreva o teste unitário/integração primeiro, focado no comportamento esperado e nos casos de erro. Valide que o teste falha.
2. **GREEN:** Escreva a quantidade mínima de código de produção para fazer o teste passar.
3. **REFACTOR:** Melhore o código escrito garantindo a tipagem estrita e os padrões de arquitetura (Clean Arch no Backend, Smart/Dumb no Frontend).
4. **COVERAGE:** Execute o relatório de cobertura localmente. Se não estiver em 100% para o arquivo alterado, crie os testes faltantes antes de finalizar.

## 2. Regras de Teste: Backend (Java / Spring Boot)
- **Frameworks:** Use JUnit 5, Mockito e AssertJ.
- **Camada de Domínio (`domain/`):** Testes unitários puros. Sem contexto do Spring. Teste regras de negócio pesadas, cálculos e validações. Mocks não devem ser usados para classes do próprio domínio, apenas para portas (interfaces).
- **Camada de Aplicação (`application/`):** Testes unitários com Mockito (`@ExtendWith(MockitoExtension.class)`). Mocke os repositórios e integrações externas.
- **Camada de API (`api/`):** Testes de WebMvc (`@WebMvcTest`). Mocke a camada de aplicação. Verifique status HTTP, validações de DTO (`@Valid`) e retornos JSON.
- **Camada de Infraestrutura (`infrastructure/`):** Testes de Integração usando **Testcontainers** (PostgreSQL) e `@DataJpaTest` para repositórios. Nunca use banco em memória (H2) se houver consultas nativas específicas do Postgres.

## 3. Regras de Teste: Frontend & Dashboard (React / Vite)
- **Frameworks:** Use Vitest e React Testing Library (`@testing-library/react`).
- **Comportamento > Implementação:** Teste o que o usuário vê e interage (ex: `screen.getByRole('button', { name: /salvar/i })`). Não teste estados internos do React ou hooks isolados a menos que seja um hook customizado complexo.
- **Mocks de Serviço:** Nunca faça chamadas HTTP reais nos testes do frontend. Mocke a camada `src/services/` usando `vi.mock()`.
- **Casos Extremos (Edge Cases):** Sempre teste:
  - O caminho feliz (Happy Path).
  - Estados de carregamento (Loading spinners).
  - Estados de erro (Exibição de mensagens de falha da API).
  - Listas vazias.

## 4. Auditoria de Cobertura (O Caminho para os 100%)
- Quando solicitado para cobrir código existente, você deve primeiro identificar quais branches lógicos (`if/else/catch`) não estão cobertos.
- Escreva testes específicos para simular exceções, timeouts e dados nulos.
- **Frontend:** Rode `npm run test -- --coverage` para verificar.
- **Backend:** Rode `mvn test jacoco:report` para verificar.

## 5. Prevenção de Falsos Positivos
- Um teste que passa mas não possui asserções (Asserts / Expects) é inútil. TODO teste deve ter validações claras do estado final ou do retorno.
- Não crie testes "vazios" apenas para enganar o medidor de cobertura.