package com.atelie.ecommerce.api.marketing.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FavoriteRankingDTO(
        UUID productId,
        String productName,
        String productImage,
        BigDecimal productPrice,
        long favCount) {
}
