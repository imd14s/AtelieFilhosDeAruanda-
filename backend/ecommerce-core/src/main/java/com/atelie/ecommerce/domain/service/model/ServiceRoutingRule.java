package com.atelie.ecommerce.domain.service.model;

import java.util.UUID;

/**
 * matchJson / behaviorJson serão interpretados pela engine.
 * (ex.: "country=BR", "orderTotal>=200", etc)
 */
public record ServiceRoutingRule(
        UUID id,
        ServiceType serviceType,
        String providerCode,
        boolean enabled,
        int priority,
        String matchJson,
        String behaviorJson
) {}
