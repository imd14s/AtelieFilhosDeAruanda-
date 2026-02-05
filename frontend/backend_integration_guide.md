# Backend Integration Guide for Frontend

This document outlines the recent backend updates to support the Storefront requirements.

## 1. Product Catalog Improvements
- **GET /api/products**
  - Now supports filtering by `slug` and `categoryId`.
  - Example: `GET /api/products?slug=my-product-slug`
  - Example: `GET /api/products?categoryId=uuid...`
  - The `slug` field has been added to the Product entity and is auto-generated from the name if strictly necessary.

## 2. Checkout Endpoints
The following endpoints were created to support the checkout flow without creating orders prematurely:

- **POST /api/checkout/calculate-shipping**
  - **Payload**: `{ "cep": "00000-000", "items": [...] }`
  - **Response**: List of quotes `[{ "provider": "CORREIOS", "price": 15.00, ... }]`
  - *Note*: Currently returns an empty list or mock as the multi-provider service logic is being finalized.

- **POST /api/checkout/process**
  - **Payload**: Full order details.
  - **Response**: `{ "status": "ORDER_CREATED", "orderId": "..." }`

## 3. Settings (Admin/Config)
For the admin panel or store config:

- **Shipping Providers**: `GET /api/settings/shipping`, `PUT /api/settings/shipping/{id}`
- **Payment Providers**: `GET /api/settings/payment`, `PUT /api/settings/payment/{id}`
