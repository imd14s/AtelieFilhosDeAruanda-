package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.api.order.dto.OrderResponse;
import com.atelie.ecommerce.api.order.dto.OrderItemResponse;
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

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderEntity created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    // CORREÇÃO: Paginação e DTO para evitar crash em produção
    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return orderService.getAllOrders(pageable).map(this::toResponse);
    }

    // Mapper Simples
    private OrderResponse toResponse(OrderEntity entity) {
        var items = entity.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getTotalPrice()
                )).collect(Collectors.toList());

        return new OrderResponse(
                entity.getId(),
                OrderStatus.valueOf(entity.getStatus()),
                entity.getSource(),
                entity.getExternalId(),
                entity.getCustomerName(),
                entity.getTotalAmount(),
                entity.getCreatedAt().atZone(java.time.ZoneId.of("UTC")).toLocalDateTime(),
                items
        );
    }
}
