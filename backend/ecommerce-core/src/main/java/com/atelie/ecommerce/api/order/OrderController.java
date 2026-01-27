package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.api.order.dto.OrderItemResponse;
import com.atelie.ecommerce.api.order.dto.OrderResponse;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderEntity;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody @Valid CreateOrderRequest request) {
        OrderEntity order = orderService.createOrder(request);
        OrderResponse response = mapToResponse(order);
        
        return ResponseEntity
                .created(URI.create("/api/orders/" + order.getId()))
                .body(response);
    }

    private OrderResponse mapToResponse(OrderEntity entity) {
        var items = entity.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()))
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                entity.getId(),
                entity.getStatus(),
                entity.getSource(),
                entity.getExternalId(),
                entity.getCustomerName(),
                entity.getTotalAmount(),
                entity.getCreatedAt(),
                items
        );
    }
}
