package com.atelie.ecommerce.domain.order.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderModel {
    UUID getId();

    String getCustomerName();

    String getCustomerEmail();

    String getCustomerDocument();

    String getStatus();

    BigDecimal getTotalAmount();

    String getSource();

    String getExternalId();

    Instant getCreatedAt();

    List<? extends OrderItemModel> getItems();

    BigDecimal getShippingCost();

    // Add shipping fields if needed for NFe
    String getShippingStreet();

    String getShippingNumber();

    String getShippingComplement();

    String getShippingNeighborhood();

    String getShippingCity();

    String getShippingState();

    String getShippingZipCode();

    void setNfeReceipt(String receipt);
}
