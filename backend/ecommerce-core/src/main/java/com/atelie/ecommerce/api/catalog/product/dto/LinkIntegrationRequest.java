package com.atelie.ecommerce.api.catalog.product.dto;

import com.atelie.ecommerce.domain.order.OrderSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LinkIntegrationRequest(
    @NotNull(message = "Integration type is required")
    OrderSource integrationType, // MERCADO_LIVRE, TIKTOK
    
    @NotBlank(message = "External ID is required")
    String externalId,           // MLB-123456
    
    String skuExternal           // Opcional
) {}
