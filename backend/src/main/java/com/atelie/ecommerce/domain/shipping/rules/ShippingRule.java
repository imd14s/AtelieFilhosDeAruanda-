package com.atelie.ecommerce.domain.shipping.rules;

import java.util.UUID;

public record ShippingRule(
        UUID id,
        String name,
        boolean active,
        int priority, // Maior valor = maior prioridade
        ShippingRuleTrigger trigger,
        ShippingRuleBenefit benefit) {
}
