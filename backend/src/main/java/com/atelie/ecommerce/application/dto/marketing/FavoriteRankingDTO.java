package com.atelie.ecommerce.application.dto.marketing;

import java.math.BigDecimal;
import java.util.UUID;

public record FavoriteRankingDTO(
        UUID productId,
        String productName,
        String productImage,
        BigDecimal productPrice,
        long favCount) {
}
