package com.atelie.ecommerce.api.inventory.dto;

import java.util.UUID;

public record InventoryBalanceResponse(
    UUID productId,
    Integer currentStock
) {}
