package com.atelie.ecommerce.domain.shipping.strategy;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ShippingStrategy {

    ShippingResult calculate(ShippingParams params);

    default boolean supports(String providerName) {
        return false;
    }

    record ShippingParams(
            String destinationCep,
            BigDecimal subtotal,
            List<ShippingItem> items,
            String tenantId) {
    }

    record ShippingItem(
            UUID productId,
            UUID variantId,
            int quantity,
            BigDecimal weight,
            BigDecimal length,
            BigDecimal height,
            BigDecimal width) {
    }

    record ShippingResult(
            String providerName,
            boolean success,
            boolean eligible,
            boolean freeShipping,
            BigDecimal cost,
            BigDecimal threshold,
            String estimatedDays,
            String error,
            String appliedRuleName,
            BigDecimal originalCost,
            String persuasiveMessage) {
        public static ShippingResult failure(String provider, String error) {
            return new ShippingResult(provider, false, false, false, BigDecimal.ZERO, BigDecimal.ZERO, null, error,
                    null, null, null);
        }
    }
}
