package com.atelie.ecommerce.api.catalog.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LinkIntegrationRequest(
        @NotNull(message = "Integration ID is required") java.util.UUID integrationId,

        @NotBlank(message = "External ID is required") String externalId,

        String skuExternal) {
}
