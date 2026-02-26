package com.atelie.ecommerce.infrastructure.shipping.strategies;

import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OfflineContingencyStrategy implements ShippingStrategy {

    @Override
    public boolean supports(String providerName) {
        return "OFFLINE".equalsIgnoreCase(providerName);
    }

    @Override
    public ShippingResult calculate(ShippingParams params) {
        // Regra de frete fixo para contingência
        BigDecimal fixedCost = new BigDecimal("25.00");
        String estimatedDays = "7-10 dias (Contingência)";

        return new ShippingResult(
                "OFFLINE_CONTINGENCY",
                true,
                true,
                false,
                fixedCost,
                BigDecimal.ZERO,
                estimatedDays,
                null);
    }
}
