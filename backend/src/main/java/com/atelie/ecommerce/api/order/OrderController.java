package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.application.dto.order.CreateOrderRequest;
import com.atelie.ecommerce.application.dto.order.OrderResponse;
import com.atelie.ecommerce.application.dto.order.OrderItemResponse;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // @api-status: stable
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderEntity created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.getAllOrders(pageable).map(this::toResponse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<OrderResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(orderService.getOrderById(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveOrder(@PathVariable UUID id) {
        orderService.approveOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID id, @RequestBody(required = false) String reason) {
        orderService.cancelOrder(id, reason != null ? reason : "Cancelado pelo administrador");
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<Void> markAsShipped(@PathVariable UUID id) {
        orderService.markAsShipped(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<Void> markAsDelivered(@PathVariable UUID id) {
        orderService.markAsDelivered(id);
        return ResponseEntity.ok().build();
    }

    // Mapper Simples
    private OrderResponse toResponse(OrderEntity entity) {
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
                null, // paymentMethod (not yet persisted in OrderEntity)
                null, // paymentStatus (not yet persisted in OrderEntity)
                BigDecimal.ZERO, // discount (not yet persisted in OrderEntity)
                entity.getCreatedAt() != null
                        ? entity.getCreatedAt().atZone(java.time.ZoneId.of("UTC")).toLocalDateTime()
                        : java.time.LocalDateTime.now(),
                items,
                entity.getInvoiceUrl(),
                entity.getLabelUrlMe(),
                entity.getLabelUrlCustom(),
                entity.getTrackingCode(),
                entity.getShippingIdExternal(),
                entity.getCustomerDocument());
    }
}
