package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.application.dto.order.CreateOrderRequest;
import com.atelie.ecommerce.application.dto.order.OrderResponse;
import com.atelie.ecommerce.application.service.order.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
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
}
