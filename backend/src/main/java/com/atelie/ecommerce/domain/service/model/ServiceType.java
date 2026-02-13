package com.atelie.ecommerce.domain.service.model;

public enum ServiceType {
    SHIPPING,
    PAYMENT,
    NOTIFICATION, // Novo: Para SMS/Email via Webhook
    GENERIC, // Novo: Para automações gerais
    MARKETPLACE // Novo: Para integrações de loja (TikTok, Mercado Livre)
}
