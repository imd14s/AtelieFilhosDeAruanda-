# API Routes Map (for Agent Manager)

Este arquivo documenta as rotas do Backend (`ecommerce-core`) disponíveis para integração no `dashboard-admin`.
URL Base (Dev): `http://localhost:8080`

## 1. Autenticação (Admin)
O dashboard deve obter um token JWT antes de acessar as rotas protegidas.

- **Login**
  - **POST** `/api/auth/login`
  - **Body**: `{ "email": "admin@atelie.com", "password": "..." }`
  - **Response**: `{ "token": "...", "accessToken": "..." }`

## 2. Dashboard & Gestão de Produtos
Rotas otimizadas para visão administrativa (tabelas, métricas).

- **Listar Produtos (Visão Admin)**
  - **GET** `/api/dashboard/products`
  - **Response**: Lista completa de produtos (incluindo status, IDs internos).

- **Toggle Alerta de Estoque**
  - **PUT** `/api/dashboard/products/{id}/toggle-alert`
  - **Response**: Produto atualizado.

## 3. Administração de Pedidos
Ações sensíveis sobre pedidos.

- **Cancelar Pedido**
  - **POST** `/api/admin/orders/{id}/cancel`
  - **Body (Opcional)**: `{ "reason": "Motivo do cancelamento" }`

## 4. Configurações do Sistema
Gerenciamento dinâmico de chaves de configuração (Feature Flags, Variáveis).

- **Listar Configurações**
  - **GET** `/api/admin/configs`

- **Criar/Atualizar Configuração**
  - **POST** `/api/admin/configs`
  - **Body**: `{ "key": "SITE_MAINTENANCE", "value": "true", "description": "..." }`

- **Remover Configuração**
  - **DELETE** `/api/admin/configs/{key}`

## 5. Utilitários Públicos
Uteis para verificação de status e previews.

- **Health Check**: `GET /api/health`
- **Catálogo Público**: `GET /api/products`
