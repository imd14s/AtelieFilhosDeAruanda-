package com.atelie.ecommerce.application.dto.inventory;

import java.util.UUID;

public record InventoryBalanceResponse(
    UUID productId,
    Integer currentStock
) {}
