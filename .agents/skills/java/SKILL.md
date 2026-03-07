# Skill: Desenvolvedor Java 21 Blindado (Strict & Modern Mode)

## 🎯 Objetivo da Skill
Capacitar o agente Antigravity a gerar, refatorar e analisar código Java utilizando as funcionalidades mais modernas do Java 21. O foco absoluto é a assertividade, garantindo 100% de previsibilidade, imutabilidade e segurança em tempo de compilação, sem margem para comportamentos inesperados no sistema.

## ⛔ Restrições Absolutas (Obrigatório)
O agente deve seguir estas regras em todas as interações:
1. **Zero Tipos Crus (Raw Types):** O uso de coleções ou classes genéricas sem a definição explícita de tipos (ex: usar apenas `List` em vez de `List<String>`) é estritamente proibido.
2. **Zero Castings Inseguros:** Proibido forçar tipos às cegas (ex: `(MinhaClasse) objeto`). Toda verificação de tipo deve utilizar *Pattern Matching* (`if (objeto instanceof MinhaClasse mc)`).
3. **Zero `NullPointerException`:** Se um método puder não retornar um valor, ele deve obrigatoriamente retornar `java.util.Optional<T>`. O uso de `null` como retorno de negócio é proibido.
4. **Certeza de 100% e Exaustividade:** O código só deve ser gerado se cobrir 100% dos cenários possíveis da regra de negócio exigida.

## 🛠️ Diretrizes de Arquitetura e Tipagem (Java 21)
- **Imutabilidade Padrão com Records:** Utilize `record` nativo do Java para todos os DTOs, valores de retorno e modelos de dados para garantir imutabilidade de ponta a ponta.
- **Hierarquias Fechadas com Sealed Classes:** Para representar estados previsíveis (como Sucesso/Falha), utilize `sealed interface` ou `sealed class`. O compilador saberá exatamente quais são as subclasses permitidas, impedindo extensões indesejadas.
- **Pattern Matching Avançado:** Utilize `switch` expressions com *Pattern Matching* sobre *Sealed Classes*. Isso força o compilador a checar se todos os casos possíveis foram mapeados, garantindo 100% de cobertura de código sem precisar de um bloco `default` genérico e inseguro.
- **Erros Previsíveis:** Erros de regra de negócio devem ser tratados com retornos previsíveis (uma interface selada contendo os tipos de retorno) em vez de usar exceções (`try/catch`) para fluxo de controle lógico. Exceções devem ser exclusivas para falhas reais de infraestrutura.

## 📥 Formato de Entrada Esperado
O usuário fornecerá:
- A regra de negócio a ser desenvolvida.
- O contexto de dados de entrada e saída.

## 📤 Formato de Saída (Output)
A resposta deve conter exclusivamente:
1. O código Java 21 formatado, aplicando Records, Sealed Classes e Switch Expressions.
2. Uma breve explicação técnica provando como a estrutura garante a assertividade e a cobertura de todos os cenários no momento da compilação.