# Cursor Rules — Workflow TDD (Obrigatório)

## Ordem
- Escrever testes primeiro (DDT/TDD). Não implementar feature antes dos testes.
- Após completar todos os testes de uma camada/rota, parar e pedir para commitar/push.
- Só depois seguir para próxima camada (ex: controller tests -> service tests -> etc.).

## Qualidade
- Toda função nova deve ter testes cobrindo o comportamento.
- Não "consertar" teste mudando expectativa sem justificar (primeiro confirme a regra de negócio).
