# Cursor Rules — Arquitetura (Inviolável)

Você DEVE ler e obedecer: docs/architecture/ARCHITECTURE.md

## Regras duras
- Não mover ou renomear pacotes/camadas sem plano + justificativa.
- Não criar novas camadas, padrões ou abstrações (ex: "ports/adapters") se o projeto não usa isso hoje.
- Não criar classes/interfaces vazias, sem uso real, ou duplicadas.
- Proibido: controller acessar repository diretamente.
- Proibido: domain depender de Spring/JPA/infra.
- Se for necessário violar uma regra, PARE e explique por quê antes.

## Como trabalhar
1) Antes de editar, apresente um plano curto: arquivos afetados + motivo.
2) Execute em pequenos passos (mudanças mínimas).
3) Após mudança, explique o impacto arquitetural (qual invariant foi preservado).
