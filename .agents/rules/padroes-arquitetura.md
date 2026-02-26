---
trigger: always_on
---

# Leis de Engenharia do Ateliê Filhos de Aruanda

## 1. Contexto e Arquitetura
- **VOCÊ DEVE** consultar o arquivo `/docs-ai/MASTER_INDEX.md` silenciosamente antes de propor ou executar qualquer alteração de código.
- **Restrição Frontend:** Uso estrito de TypeScript (React + Vite). O uso do tipo `any` é terminantemente proibido.
- **Restrição Backend:** Clean Architecture estrita (Java/Spring). Nunca importe classes da `infrastructure` na camada de `api` ou `domain`.

## 2. Validação Obrigatória (Quality Gate)
- Sempre verifique suas alterações localmente no terminal antes de reportar a conclusão.
- **Frontend:** Você deve rodar o linter e o build do Vite para garantir a ausência do tipo `any` e erros de sintaxe.
- **Backend:** Você deve rodar a compilação do Spring (ex: `mvn clean compile` ou `./gradlew build`) para garantir que as fronteiras da Clean Architecture não foram violadas.
- Se qualquer erro ocorrer, você deve corrigi-lo autonomamente antes de prosseguir.

## 3. Fluxo de Entrega (Git & Deploy para Dev)
- Após a feature ser gerada e validada com **sucesso absoluto** no passo anterior, siga o fluxo:
  1. Realize o commit das alterações utilizando o padrão *Conventional Commits* (ex: `feat: adiciona nova funcionalidade`).
  2. Faça o checkout/integração com a branch `dev`, garantindo que não há conflitos.
  3. Execute o push das alterações validadas para a branch remota `dev`.
- Finalize reportando o sucesso da operação e o hash do commit.