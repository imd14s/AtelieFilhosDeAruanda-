package com.atelie.ecommerce.api.subscription.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SubscriptionPlanDTO(
                UUID id,
                String type,
                String name,
                String description,
                BigDecimal basePrice,
                Integer minProducts,
                Integer maxProducts,
                Boolean isCouponPack,
                Integer couponBundleCount,
                BigDecimal couponDiscountPercentage,
                Integer couponValidityDays,
                Boolean active,
                List<FrequencyRuleDTO> frequencyRules,
                List<PlanProductDTO> products) {
        public record FrequencyRuleDTO(
                        UUID id,
                        String frequency,
                        BigDecimal discountPercentage) {
        }

        public record PlanProductDTO(
                        UUID productId,
                        String productName,
                        Integer quantity) {
        }
}
