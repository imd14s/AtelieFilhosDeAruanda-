package com.atelie.ecommerce.domain.provider;

import java.math.BigDecimal;

public record RouteContext(
        String country,
        String cep,
        BigDecimal cartTotal
) {}
