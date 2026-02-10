---
name: database-perf
description: Garante performance e integridade do banco de dados.
---

# Performance de Banco

1. **Indexação:**
   - Ao criar tabelas ou queries, verifique se as colunas usadas no `WHERE` ou `JOIN` possuem índices.

2. **N+1 Problem:**
   - Evite queries dentro de loops. Use `JOINs` ou `include` (se usar ORM) para buscar dados relacionados de uma vez.

3. **Conexões:**
   - Utilize Connection Pooling para reaproveitar conexões e não sobrecarregar o banco.
