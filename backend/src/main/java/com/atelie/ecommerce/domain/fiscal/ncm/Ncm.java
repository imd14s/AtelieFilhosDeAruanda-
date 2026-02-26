package com.atelie.ecommerce.domain.fiscal.ncm;

import java.util.UUID;

public record Ncm(
        UUID id,
        String code,
        String description) {
}
