package com.atelie.ecommerce.application.mapper;

import com.atelie.ecommerce.application.dto.order.OrderItemResponse;
import com.atelie.ecommerce.application.dto.order.OrderResponse;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(OrderEntity entity) {
        if (entity == null)
            return null;

        var items = entity.getItems().stream()
                .map(i -> {
                    String productName = i.getProductName();
                    UUID productId = null;
                    String imageUrl = "/images/default.png";
                    UUID variantId = null;

                    if (i.getProduct() != null) {
                        productId = i.getProduct().getId();
                        if (productName == null) {
                            productName = i.getProduct().getName();
                        }
                        if (i.getProduct().getImages() != null && !i.getProduct().getImages().isEmpty()) {
                            imageUrl = i.getProduct().getImages().get(0);
                        }
                    }

                    if (i.getVariant() != null) {
                        variantId = i.getVariant().getId();
                    }

                    return new OrderItemResponse(
                            productId,
                            productName,
                            i.getQuantity(),
                            i.getUnitPrice(),
                            i.getTotalPrice(),
                            imageUrl,
                            variantId);
                })
                .collect(Collectors.toList());

        String address = entity.getShippingStreet() != null
                ? String.format("%s, %s%s - %s, %s - %s, %s",
                        entity.getShippingStreet(),
                        entity.getShippingNumber(),
                        entity.getShippingComplement() != null && !entity.getShippingComplement().isEmpty()
                                ? " (" + entity.getShippingComplement() + ")"
                                : "",
                        entity.getShippingNeighborhood(),
                        entity.getShippingCity(),
                        entity.getShippingState(),
                        entity.getShippingZipCode())
                : null;

        return new OrderResponse(
                entity.getId(),
                OrderStatus.valueOf(entity.getStatus()),
                entity.getSource(),
                entity.getExternalId(),
                entity.getCustomerName(),
                entity.getTotalAmount(),
                entity.getShippingCost(),
                address,
                entity.getShippingProvider(),
                null, // paymentMethod
                null, // paymentStatus
                BigDecimal.ZERO, // discount
                entity.getCreatedAt() != null
                        ? entity.getCreatedAt().atZone(java.time.ZoneId.of("UTC")).toLocalDateTime()
                        : java.time.LocalDateTime.now(),
                items,
                entity.getInvoiceUrl(),
                entity.getNfeReceipt(),
                entity.getLabelUrlMe(),
                entity.getLabelUrlCustom(),
                entity.getTrackingCode(),
                entity.getShippingIdExternal(),
                entity.getCustomerDocument());
    }
}
