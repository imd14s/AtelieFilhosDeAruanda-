package com.atelie.ecommerce.api.order.dto;

import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.domain.order.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    OrderStatus status,
    OrderSource source,
    String externalId,
    String customerName,
    BigDecimal totalAmount,
    LocalDateTime createdAt,
    List<OrderItemResponse> items
) {}
