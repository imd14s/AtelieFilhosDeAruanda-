# Padrões de Desenvolvimento e Arquitetura (Deep Context)

Este documento estabelece a "Referência de Ouro" e os padrões de codificação para o projeto, garantindo consistência no desenvolvimento por humanos e agentes de IA.

**Data de Definição:** 04/02/2026

---

## 1. Referência de Ouro ("Golden Reference")

Para qualquer dúvida sobre estrutura, estilo ou lógica, consulte estes arquivos como a **Verdade Absoluta**:

*   **API / Controller**: [`src/main/java/com/atelie/ecommerce/api/catalog/product/ProductController.java`](../src/main/java/com/atelie/ecommerce/api/catalog/product/ProductController.java)
    *   *Nota*: Prefira usar métodos de acesso estilo Bean (`request.getName()`) em DTOs, corrigindo a leve inconsistência de estilo Record encontrada na análise inicial.
*   **Logica / Service**: [`src/main/java/com/atelie/ecommerce/application/service/catalog/product/ProductService.java`](../src/main/java/com/atelie/ecommerce/application/service/catalog/product/ProductService.java)

---

## 2. Padrões de Nomenclatura

*   **Classes**: `PascalCase` (ex: `ProductController`, `CreateProductRequest`).
*   **Métodos e Variáveis**: `camelCase` (ex: `saveProduct`, `categoryId`).
*   **DTOs**: Sufixos explícitos `Request` e `Response`.
    *   Devem ser POJOs (Plain Old Java Objects) com validação Jakarta (`@NotBlank`, `@NotNull`).
*   **Testes**: Sufixo `Test` (ex: `ProductServiceTest`).

---

## 3. Padrão Arquitetural

O projeto segue uma arquitetura em camadas modular (Vertical Slice por features dentro de pacotes):

1.  **API Layer (`com.atelie.ecommerce.api.*`)**:
    *   Recebe requisições HTTP (REST).
    *   Faz a validação básica (Bean Validation).
    *   Converte DTOs para Entidades (ou DTOs de Domínio).
    *   **NÃO** contém lógica de negócio complexa.
    *   Chama o `Service`.

2.  **Application Layer (`com.atelie.ecommerce.application.service.*`)**:
    *   Contém a lógica de negócio principal.
    *   Anotado com `@Transactional`.
    *   Retorna Entidades ou DTOs de negócio.
    *   Dispara Eventos de Domínio (ex: `ProductSavedEvent`) quando necessário, evitando acoplamento forte.

3.  **Infrastructure/Domain Layers (`com.atelie.ecommerce.infrastructure.*`, `com.atelie.ecommerce.domain.*`)**:
    *   Entidades JPA (`@Entity`).
    *   Repositórios Spring Data (`Repository`).
    *   Integrações externas (Storage, Payment).

---

## 4. Tratamento de Erros

Deve-se utilizar exceções tipadas que são interceptadas pelo `GlobalExceptionHandler`:

*   **Não Encontrado**: Lançar `NotFoundException` -> Retorna HTTP 404.
*   **Conflito/Regra de Negócio**: Lançar `ConflictException` ou `IllegalStateException` -> Retorna HTTP 409.
*   **Validação de Entrada**: `IllegalArgumentException` ou `MethodArgumentNotValidException` -> Retorna HTTP 400.
*   **Sem Acesso**: `UnauthorizedException` ou `AccessDeniedException` -> Retorna HTTP 401/403.

**Arquivo de Referência:** [`src/main/java/com/atelie/ecommerce/api/common/error/GlobalExceptionHandler.java`](../src/main/java/com/atelie/ecommerce/api/common/error/GlobalExceptionHandler.java)

---

## 5. Regras de Execução para Agentes

1.  **Bibliotecas**: NÃO adicionar novas bibliotecas ao `pom.xml` a menos que explicitamente solicitado. Use o que já está instalado (Lombok, JJWT, etc.).
2.  **Estrutura de Pastas**: Respeite a hierarquia existente. Não crie pastas na raiz `src/main/java` fora de `com.atelie.ecommerce`.
