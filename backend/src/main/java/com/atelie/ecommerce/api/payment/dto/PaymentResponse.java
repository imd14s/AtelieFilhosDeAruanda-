package com.atelie.ecommerce.api.payment.dto;

import java.math.BigDecimal;
import java.util.Map;

public record PaymentResponse(
    String status,
    String provider,
    BigDecimal amount,
    boolean sandbox,
    Map<String, Object> metadata
) {}
