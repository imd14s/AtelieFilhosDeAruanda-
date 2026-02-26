package com.atelie.ecommerce.api.fiscal.ncm.dto;

import java.util.UUID;

public record NcmResponse(
        UUID id,
        String code,
        String description) {
}
