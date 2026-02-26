package com.atelie.ecommerce.domain.order.model;

import java.math.BigDecimal;
import java.util.UUID;

public interface OrderItemModel {
    UUID getId();

    String getProductName();

    BigDecimal getUnitPrice();

    BigDecimal getTotalPrice();

    Integer getQuantity();

    // NFe specific data if needed
    String getProductNcm();

    Integer getProductOrigin();
}
