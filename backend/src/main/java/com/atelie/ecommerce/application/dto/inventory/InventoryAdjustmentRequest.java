package com.atelie.ecommerce.application.dto.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InventoryAdjustmentRequest(
    @NotNull(message = "Type is required (IN/OUT)")
    MovementType type,
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    Integer quantity,
    
    String reason,
    String referenceId
) {}
