package com.atelie.ecommerce.domain.service.model;

import java.util.UUID;

public record ServiceProvider(
        UUID id,
        ServiceType serviceType,
        String code,
        String name,
        boolean enabled,
        int priority,
        String driverKey,
        boolean healthEnabled
) {}
