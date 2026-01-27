package com.atelie.ecommerce.domain.inventory.event;

import java.util.UUID;

public record InventoryChangedEvent(
    UUID productId,
    Integer newQuantity
) {}
