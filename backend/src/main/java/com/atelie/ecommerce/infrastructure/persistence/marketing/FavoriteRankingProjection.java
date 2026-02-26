package com.atelie.ecommerce.infrastructure.persistence.marketing;

import java.math.BigDecimal;
import java.util.UUID;

public interface FavoriteRankingProjection {
    UUID getProductId();

    String getProductName();

    String getProductImage();

    BigDecimal getProductPrice();

    long getFavCount();
}
