package com.atelie.ecommerce.domain.shipping.rules;

import java.math.BigDecimal;

public record ShippingRuleBenefit(
        BenefitType type,
        BigDecimal value) {
}
