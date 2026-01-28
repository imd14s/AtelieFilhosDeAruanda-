package com.atelie.ecommerce.domain.service.engine;

import java.math.BigDecimal;
import java.util.Map;

public record ServiceContext(
        String country,
        BigDecimal orderTotal,
        Map<String, Object> attributes
) {}
