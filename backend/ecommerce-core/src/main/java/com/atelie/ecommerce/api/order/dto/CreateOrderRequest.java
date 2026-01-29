package com.atelie.ecommerce.api.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(
    @NotNull String source, // Mudado de OrderSource(Enum) para String
    String externalId,
    String customerName,
    @NotEmpty @Valid List<CreateOrderItemRequest> items
) {}
