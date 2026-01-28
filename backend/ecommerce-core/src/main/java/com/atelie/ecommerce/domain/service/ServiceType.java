package com.atelie.ecommerce.domain.service;

/**
 * Tipos de serviços suportados pelo "motor".
 * Novos serviços podem ser adicionados aqui (imutável e raro).
 * Providers são 100% controlados pelo dashboard/banco.
 */
public enum ServiceType {
    SHIPPING,
    PAYMENT,
    NOTIFICATION,
    MARKETPLACE,
    ANTIFRAUD
}
