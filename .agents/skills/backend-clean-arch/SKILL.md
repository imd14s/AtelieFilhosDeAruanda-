---
name: backend-clean-arch-guard
description: Use esta skill sempre que o usuário solicitar a criação de novos Endpoints, Serviços, Entidades, Repositórios ou integrações no Backend Java (Spring Boot).
---

# Objetivo
Garantir a integridade absoluta da Clean Architecture (Hexagonal). O núcleo da aplicação (`domain` e `application`) deve ser blindado contra detalhes de implementação técnica (`api` e `infrastructure`).

# Instruções de Execução (Regras de Fronteira Inquebráveis)

1. **Isolamento de Domínio (`domain/`):** - Aqui residem as Regras de Negócio Puras, Modelos e Interfaces (Ports).
   - REGRA CRÍTICA: É expressamente proibido importar pacotes do Spring Web, Spring Data JPA (`@Entity`, `@Table`) ou bibliotecas externas de infraestrutura aqui. O domínio não deve saber que existe um banco de dados.
2. **Camada de Aplicação (`application/`):**
   - Contém os Casos de Uso (Use Cases/Services).
   - Orquestra o fluxo de dados. Injeta as interfaces de repositório (definidas no domínio), mas nunca a implementação direta.
3. **Adaptadores de Entrada (`api/`):**
   - Controllers HTTP. 
   - Só podem interagir com a camada de `application/` e com os próprios `DTOs` (Request/Response).
   - REGRA CRÍTICA: Um Controller NUNCA deve importar ou conhecer uma Entidade de Banco de Dados (`*Entity.java`) ou interagir diretamente com a pasta `infrastructure/`.
4. **Adaptadores de Saída (`infrastructure/`):**
   - Detalhes de implementação (JPA, Webhooks, Integrações).
   - É aqui que as Entidades JPA (`*Entity.java`) vivem. Esta camada implementa as interfaces criadas no `domain/`.
5. **Tradução Mapeada:** O fluxo de dados obriga traduções ao cruzar fronteiras: 
   - Request DTO (`api`) -> Modelo de Domínio (`domain`) -> Entity JPA (`infrastructure`). 
   - Utilize métodos de conversão claros (ex: construtores ou builders) em vez de acoplamento cego.