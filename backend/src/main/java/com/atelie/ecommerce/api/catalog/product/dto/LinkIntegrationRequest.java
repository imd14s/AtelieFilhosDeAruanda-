package com.atelie.ecommerce.api.catalog.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LinkIntegrationRequest(
    @NotNull(message = "Integration type is required")
    String integrationType, // Agora aceita "SHOPEE", "MAGALU", etc.
    
    @NotBlank(message = "External ID is required")
    String externalId,
    
    String skuExternal
) {}
