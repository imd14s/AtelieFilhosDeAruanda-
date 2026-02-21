package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderRepository orderRepository;

    public AdminController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/tenants")
    public ResponseEntity<?> getTenants() {
        // Since there's no Tenant entity yet, we return an empty list to avoid fake
        // data.
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(Map.of(
                "totalSales", orderRepository.sumTotalSales(),
                "pendingOrders", orderRepository.countPendingOrders()));
    }
}
