package com.atelie.ecommerce.application.dto.catalog.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LinkIntegrationRequest(
        @NotNull(message = "Integration ID is required") java.util.UUID integrationId,

        @NotBlank(message = "External ID is required") String externalId,

        String skuExternal) {
}
