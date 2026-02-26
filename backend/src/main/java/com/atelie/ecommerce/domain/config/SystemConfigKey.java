package com.atelie.ecommerce.domain.config;

public enum SystemConfigKey {

    // Cache / Infra
    CACHE_TTL_SECONDS,

    // Shipping
    SHIPPING_J3_RATE,
    SHIPPING_FREE_LIMIT,
    SHIPPING_ENABLED,

    // Order
    ORDER_MIN_VALUE,
    ORDER_MAX_INSTALLMENTS,

    // Rules Engine
    SHIPPING_RULES
}
