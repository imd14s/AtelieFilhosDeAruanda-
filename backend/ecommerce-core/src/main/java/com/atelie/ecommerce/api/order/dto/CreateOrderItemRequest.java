package com.atelie.ecommerce.api.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateOrderItemRequest(
    @NotNull UUID productId,
    UUID variantId, // Novo campo opcional (se produto tiver variação, é obrigatório na lógica)
    @NotNull @Min(1) Integer quantity
) {}
