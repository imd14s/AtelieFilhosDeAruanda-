package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.application.service.integration.N8nService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final N8nService n8nService;

    public DashboardController(ProductRepository productRepository,
                              OrderRepository orderRepository,
                              N8nService n8nService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.n8nService = n8nService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long totalProducts = productRepository.count();
        BigDecimal totalSales = orderRepository.sumTotalSales();
        if (totalSales == null) totalSales = BigDecimal.ZERO;
        long pendingOrders = orderRepository.countPendingOrders();
        int lowStockAlerts = productRepository.findCriticalStock().size();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProducts", totalProducts);
        summary.put("totalSales", totalSales);
        summary.put("pendingOrders", pendingOrders);
        summary.put("lowStockAlerts", lowStockAlerts);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/automation/status")
    public ResponseEntity<Map<String, Boolean>> getAutomationStatus() {
        return ResponseEntity.ok(Map.of("enabled", n8nService.isAutomationEnabled()));
    }
}
