package com.atelie.ecommerce.api.dashboard;

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

    public DashboardController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        // Usa o repositório existente para contar produtos reais
        long totalProducts = productRepository.count();
        
        // Mock para Vendas (pois a estrutura de Order é complexa no seu projeto original)
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProducts", totalProducts);
        summary.put("totalSales", new BigDecimal("1500.00")); 
        summary.put("pendingOrders", 3);
        summary.put("lowStockAlerts", 0);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/automation/status")
    public ResponseEntity<Map<String, Boolean>> getAutomationStatus() {
        return ResponseEntity.ok(Map.of("enabled", true));
    }
}
