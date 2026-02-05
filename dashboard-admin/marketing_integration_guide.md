# Marketing Module Integration Guide

This document details the new Marketing endpoints available for the Dashboard.

## 1. Coupons (Cupons de Desconto)
- **Base URL**: `/api/marketing/coupons`
- **GET /**: List all coupons.
- **POST /**: Create a new coupon.
  ```json
  {
    "code": "SUMMER10",
    "type": "PERCENTAGE",
    "value": 10.00,
    "usageLimit": 100
  }
  ```
- **PATCH /{id}**: Update status (active/inactive).
- **DELETE /{id}**: Remove coupon.

## 2. Abandoned Cart Recovery
- **Base URL**: `/api/marketing/abandoned-carts`
- **GET /**: Get current configuration.
- **PUT /**: Update configuration.
  ```json
  {
    "enabled": true,
    "triggers": [
      { "delayMinutes": 60, "subject": "Come back!" }
    ]
  }
  ```
- **Backend Logic**: A scheduler (`AbandonedCartScheduler`) has been implemented to process these triggers every 5 minutes (logic currently in skeleton mode).
