package com.atelie.ecommerce.domain.service.model;

/**
 * Provider habilitado no sistema, controlado por DB/Dashboard.
 *
 * Ex:
 *  code      = "J3"
 *  driverKey = "shipping.j3"
 *  enabled   = true
 *  priority  = 1
 */
public record ServiceProvider(
        String code,
        String driverKey,
        boolean enabled,
        int priority
) {}
