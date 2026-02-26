# ⚙️ MAPA DE CONTEXTO: BACKEND

## 📌 Stack Tecnológica
- Java 17
- Spring Boot 3
- Maven
- Arquitetura: Clean Architecture / Hexagonal (Estrita)

## 🏗️ Estrutura de Camadas (Regras de Isolamento)
O backend está no pacote `com.atelie.ecommerce`. A violação destas regras causará falha na revisão.

### 1. `api/` (Interface Adapters / Controllers)
- **O que faz:** Recebe requisições HTTP e retorna respostas (DTOs).
- **Regras:** - SÓ pode injetar classes de `application/service/`.
  - NUNCA injetar Repositories ou acessar `infrastructure/` diretamente.
  - Usar sempre os DTOs de `api/[dominio]/dto/`.
  - Tratamento de erro padronizado via `api/common/exception/GlobalExceptionHandler.java`.

### 2. `application/` (Use Cases / Services)
- **O que faz:** Orquestração da lógica de negócio.
- **Regras:**
  - Contém serviços e listeners (`application/service/`, `application/listener/`).
  - Interage com interfaces do `domain/` (Ports) para buscar dados.
  - Não deve conter anotações de infraestrutura pesada (como `@Entity` ou integrações web específicas).

### 3. `domain/` (Core / Entities / Ports)
- **O que faz:** O coração do sistema. Modelos de negócio, regras puras e interfaces de repositório.
- **Regras:**
  - PROIBIDO dependências do Spring Data (ex: `@Entity`, `@Table`, `@Column`). Aqui são apenas POJOs puros (Records ou Classes).
  - Interfaces de repositórios (ex: `InventoryRepository.java`) ficam aqui, mas a implementação fica na `infrastructure/`.
  - Contém eventos de domínio (`domain/[dominio]/event/`).

### 4. `infrastructure/` (Frameworks / DB / External Services)
- **O que faz:** Implementação técnica. Banco de dados, segurança, clientes externos.
- **Regras:**
  - `infrastructure/persistence/`: Aqui ficam as entidades JPA (`*Entity.java`) e as interfaces do Spring Data JPA.
  - `infrastructure/security/`: Filtros JWT, configurações de WebSecurity.
  - `infrastructure/service/`: Implementação de gateways, clientes externos (MelhorEnvio, MercadoPago, etc).

## 🧩 Domínios Principais Existentes (Silos)
Quando criar features, siga o isolamento dos diretórios abaixo. Não misture contextos.
- `admin` (Gestão e regras de tenant)
- `auth` (Autenticação, JWT)
- `catalog` (Produtos, Categorias, Variantes)
- `checkout` & `cart` (Carrinho e finalização)
- `fiscal` (Integração de Notas Fiscais, Bling, Tiny)
- `marketing` (Cupons, Campanhas, Carrinho Abandonado)
- `order` (Pedidos)
- `payment` (Mercado Pago, Cartões, Pix)
- `serviceengine` (Motor de regras dinâmicas e roteamento de serviços)
- `shipping` (Frete, MelhorEnvio)
- `subscription` (Assinaturas e recorrência)

## 🔄 Fluxo Obrigatório para Nova Feature (Exemplo: "Banner")
1. Crie a interface de persistência pura em `domain/banner/BannerRepository.java`.
2. Crie a Entidade JPA em `infrastructure/persistence/banner/BannerEntity.java`.
3. Crie o Repositório JPA em `infrastructure/persistence/banner/JpaBannerRepository.java` (implementando `BannerRepository`).
4. Crie a lógica em `application/service/banner/BannerService.java`.
5. Crie DTOs em `api/banner/dto/`.
6. Crie o EndPoint em `api/banner/BannerController.java`.