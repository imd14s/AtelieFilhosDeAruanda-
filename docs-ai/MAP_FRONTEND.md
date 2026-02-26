# 🎨 MAPA DE CONTEXTO: FRONTEND (E-commerce do Cliente)

## 📌 Stack Tecnológica
- React (Vite)
- **Linguagem Oficial:** TypeScript / TSX (Migração em andamento. Proibido criar novos arquivos `.js` ou `.jsx`)
- Gerenciamento de Estado: React Context
- Roteamento: React Router

## 🏗️ Estrutura de Diretórios e Regras de Isolamento

### 1. `src/types/` (Contratos de Dados)
- **O que faz:** Define todas as interfaces e tipagens do sistema (Frontend).
- **Regras Estritas:**
  - Espelha os DTOs do Backend Java.
  - É **expressamente proibido** o uso do tipo `any`. Use `unknown` se estritamente necessário e faça a validação (type narrowing).

### 2. `src/services/` (Comunicação com API / Backend)
- **O que faz:** Todas as chamadas HTTP para o backend.
- **Regras Estritas:**
  - PROIBIDO usar `fetch` ou `axios` diretamente nas Pages ou Components.
  - Todas as respostas de API devem ser tipadas usando as interfaces definidas em `src/types/` (ex: `Promise<ProductResponse>`).
  - O arquivo `api.ts` contém a configuração base.

### 3. `src/components/` (Componentes Visuais)
- **O que faz:** Elementos de UI reutilizáveis (ex: `ProductCard.tsx`, `Header.tsx`).
- **Regras Estritas:**
  - Tipagem obrigatória para todas as `Props` (ex: `interface ProductCardProps { ... }`).
  - Componentes devem ser o mais "burros" possível. Recebem dados, emitem eventos. Lógica complexa fica nas páginas.

### 4. `src/pages/` (Páginas / Views)
- **O que faz:** Agrupa componentes para formar as telas do sistema e gerencia o ciclo de vida.
- **Regras Estritas:**
  - É aqui que os Hooks de estado e chamadas a `services` devem ocorrer.

### 5. `src/context/` (Estado Global)
- **O que faz:** Compartilha estados entre componentes distantes (ex: `FavoritesContext.tsx`).
- **Regras Estritas:**
  - O contexto e seus provedores devem ter tipagem estrita para os valores que exportam.

## 🔄 Fluxo Obrigatório para Nova Feature (Exemplo: "Página de Promoções")
1. Defina a interface em `src/types/marketing.ts` (espelhando o DTO do Java).
2. Adicione os métodos no serviço `src/services/marketingService.ts` retornando o tipo correto.
3. Crie componentes visuais puros e tipados em `src/components/` (ex: `PromoBanner.tsx`).
4. Monte a página em `src/pages/PromotionsPage.tsx` chamando o serviço e passando dados para os componentes.