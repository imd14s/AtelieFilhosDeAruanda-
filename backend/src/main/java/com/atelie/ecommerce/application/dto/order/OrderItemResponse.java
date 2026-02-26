package com.atelie.ecommerce.application.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
                UUID productId,
                String productName,
                Integer quantity,
                BigDecimal unitPrice,
                BigDecimal totalPrice,
                String productImage,
                UUID variantId) {
}
