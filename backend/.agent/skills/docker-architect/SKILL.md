---
name: docker-architect
description: Otimiza imagens Docker e orquestração.
---

# Otimização de Containers

1. **Imagens Leves:**
   - Use versões `-alpine` ou `-slim` para Node, Python ou Go.
   - Objetivo: Manter imagens abaixo de 200MB sempre que possível.

2. **Multi-Stage Builds:**
   - Use build em estapas para não levar dependências de desenvolvimento (dev dependencies) para a produção.

3. **Limites de Recursos (Docker Compose):**
   - Defina sempre `mem_limit` e `cpus` no docker-compose para evitar que um serviço derrube o servidor.
