package com.atelie.ecommerce.api.order.dto;

import com.atelie.ecommerce.domain.order.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        OrderStatus status,
        String source,
        String externalId,
        String customerName,
        BigDecimal totalAmount,
        BigDecimal shippingCost,
        String shippingAddress,
        String shippingProvider,
        String paymentMethod,
        String paymentStatus,
        BigDecimal discount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items,
        String invoiceUrl,
        String labelUrlMe,
        String labelUrlCustom,
        String trackingCode,
        String shippingIdExternal) {
}
