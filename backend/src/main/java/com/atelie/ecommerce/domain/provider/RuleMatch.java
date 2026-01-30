package com.atelie.ecommerce.domain.provider;

public record RuleMatch(
        boolean matched,
        String reason
) {}
