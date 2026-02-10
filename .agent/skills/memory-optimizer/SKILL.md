---
name: memory-optimizer
description: Garante baixo consumo de RAM e evita memory leaks.
---

# Diretrizes de Eficiência

1. **Paginação Obrigatória:**
   - Proibido usar `findAll` ou select sem LIMIT em tabelas grandes (Logs, Pedidos, Usuários).
   - Implemente paginação por cursor ou offset na API.

2. **Gerenciamento de Streams:**
   - Para uploads/downloads ou processamento de arquivos grandes, use Streams (Node.js) ou Iterators (Python).
   - Nunca carregue arquivos inteiros na memória RAM.

3. **Limpeza de Recursos:**
   - Feche conexões de banco e listeners de eventos após o uso.
