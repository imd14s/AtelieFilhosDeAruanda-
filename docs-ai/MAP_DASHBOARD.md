# 📊 MAPA DE CONTEXTO: DASHBOARD ADMIN

## 📌 Stack Tecnológica
- React (Vite)
- **Linguagem Oficial:** TypeScript / TSX (Proibido criar arquivos `.jsx` ou `.js` para código fonte)
- Estilização: Tailwind CSS
- Gestão de Multi-Tenant implícita.

## 🏗️ Estrutura de Diretórios e Regras de Isolamento

### 1. `src/types/` (Contratos de Dados)
- **O que faz:** Define todas as interfaces e tipagens do sistema.
- **Regras Estritas:**
  - É **expressamente proibido** o uso de `any`.
  - Antes de criar um serviço ou componente, defina a interface correspondente (ex: `types/product.ts`, `types/order.ts`).

### 2. `src/services/` (Integração e Lógica)
- **O que faz:** Comunicação com a API do Admin Backend.
- **Regras Estritas:**
  - Todas as respostas de API devem ser tipadas usando as interfaces definidas em `src/types/`.
  - Exemplo: `ProductService.ts` deve retornar `Promise<Product>`.
  - Usa a configuração centralizada em `src/api/axios.ts`.

### 3. `src/components/` (Componentes Isolados)
- Dividido em genéricos (`ui/Button.tsx`, `ui/BaseModal.tsx`) e de domínio (`products/MediaGallery.tsx`).
- **Regras Estritas:**
  - Tipagem obrigatória para todas as `Props`.
  - Componentes em `ui/` não podem ter dependência de domínio (não podem importar serviços ou tipos específicos de negócio).

### 4. `src/pages/` (Módulos de Gestão)
- **O que faz:** As telas do painel administrativo agrupadas por domínio (`marketing/`, `orders/`, `products/`, `settings/`).
- **Regras Estritas:**
  - Lógica complexa de formulários ou validações deve ser mantida aqui ou em hooks específicos, consumindo os serviços tipados.

## 🔄 Fluxo Obrigatório para Nova Feature (Exemplo: "Configuração de Frete")
1. Defina a interface em `src/types/store-settings.ts`.
2. Adicione os métodos CRUD no serviço `src/services/ShippingService.ts`.
3. Crie os sub-componentes visuais tipados em `src/components/shipping/`.
4. Monte a tela interativa em `src/pages/settings/ShippingPage.tsx`.