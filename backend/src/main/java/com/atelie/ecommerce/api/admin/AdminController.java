package com.atelie.ecommerce.api.admin;

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

    @GetMapping("/tenants")
    public ResponseEntity<?> getTenants() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "1", "name", "Filial SP", "active", true),
                Map.of("id", "2", "name", "Filial RJ", "active", false)));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        // Returns a mock order list to populate the dashboard/orders page
        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", "ORD-001",
                        "customerName", "João Silva",
                        "total", 150.00,
                        "status", "PAID",
                        "createdAt", LocalDateTime.now().toString())));
    }
}
