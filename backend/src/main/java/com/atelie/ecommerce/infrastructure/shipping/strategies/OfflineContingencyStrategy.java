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
        // BigDecimal fixedCost = new BigDecimal("25.00"); // No longer used
        // String estimatedDays = "7-10 dias (Contingência)"; // No longer used

        return new ShippingResult(
                "OFFLINE_CONTINGENCY",
                true,
                true,
                false, // Faltava a flag freeShipping
                new BigDecimal("50.00"), // Custo Fixo de Contingência
                BigDecimal.ZERO,
                "15",
                null,
                null, null, null);
    }
}
