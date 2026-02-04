# Mapa da Codebase (Context Map)

Este documento serve como um índice para navegação rápida no projeto, agrupando os principais Controllers (Entrada) e Services (Lógica) por domínio.

**Última Atualização:** 04/02/2026

---

## 📦 1. Catálogo e Produtos (`com.atelie.ecommerce.api/application.catalog`)
Responsável pela gestão de produtos, categorias e integrações de catálogo.

*   **Entrada (Controllers)**
    *   `ProductController`: CRUD principal de produtos. **(Golden Reference)**
    *   `CategoryController`: Gestão de categorias.
    *   `ProductVariantController`: Gestão de variações (cor, tamanho).
    *   `ProductAiController`: Geração de descrições/tags via IA.
    *   `ProductIntegrationController`: Vínculo com marketplaces.
    *   `ProductImageController`: Upload e gestão de imagens.
*   **Lógica (Services)**
    *   `ProductService`: Regras de negócio de produtos.
    *   `CategoryService`: Regras de categorias.
    *   `ProductVariantService`: Lógica de variantes.
    *   `ProductIntegrationService`: Lógica de integração/match de produtos.
    *   `GtinGeneratorService`: Geração de códigos EAN/GTIN.

## 👤 2. Autenticação e Usuários (`...api/application.auth`)
*   **Entrada**: `AuthController` (Login, Registro, Refresh Token).
*   **Lógica**: `AuthService` (Lógica JWT), `CustomUserDetailsService`.

## 🛒 3. Pedidos (`...api/application.order`)
*   **Entrada**: `OrderController` (Criação e consulta de pedidos).
*   **Lógica**: `OrderService` (Fluxo de pedidos, status).

## 💳 4. Pagamentos e Fiscal (`...api/application.payment`, `...fiscal`)
*   **Entrada**: `PaymentController` (Callbacks de gateway, iniciação).
*   **Lógica**: `PaymentService` (Processamento), `InvoiceService` (Nota Fiscal).

## 📦 5. Estoque e Logística (`...api/application.inventory`, `...shipping`)
*   **Entrada**:
    *   `InventoryController`: Ajustes manuais de saldo.
    *   `ShippingController`: Cálculo de frete e rastreio.
*   **Lógica**:
    *   `InventoryService`: Movimentação de estoque, reserva.
    *   `ShippingService`: Integração com correios/transportadoras.

## 🛠️ 6. Administração (`...api.admin`)
Painel administrativo para configurações globais.
*   `AdminOrderController`, `AdminProviderController`, `AdminConfigController`: Endpoints exclusivos para time de operações/backoffice.

## 🔌 7. Integrações Externas
*   **Mercado Livre**: `MercadoLivreService`.
*   **Webhooks**: `WebhookController` (Recebimento passivo de eventos).
*   **n8n**: `N8nService` (Gatilhos de automação).

## 📊 8. Dashboard e Relatórios
*   **Entrada**: `DashboardController` (Dados agregados para home do admin).
*   **Entrada**: `ProductManagementController` (Visões de gerenciamento em massa).

## ⚙️ 9. Infraestrutura e Configuração
*   `StaticResourceConfig`, `DynamicConfigService`: Configurações dinâmicas.
*   `MediaStorageService`: Abstração para salvar arquivos (S3/Local).
*   `HealthController`: Checkups de saúde da API.
