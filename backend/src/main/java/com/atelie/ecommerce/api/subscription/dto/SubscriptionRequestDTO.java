package com.atelie.ecommerce.api.subscription.dto;

import java.util.List;
import java.util.UUID;

public record SubscriptionRequestDTO(
        UUID planId,
        String frequency, // WEEKLY, BIWEEKLY, MONTHLY
        String cardToken,
        UUID shippingAddressId,
        List<SubscriptionItemRequestDTO> items) {
    public record SubscriptionItemRequestDTO(
            UUID productId,
            Integer quantity) {
    }
}
