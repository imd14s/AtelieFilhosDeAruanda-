package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.api.dashboard.dto.DashboardSummary;
import com.atelie.ecommerce.application.service.integration.N8nService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final N8nService n8nService;
    private final SystemConfigRepository configRepository;
    private final DynamicConfigService dynamicConfigService;

    public DashboardController(OrderRepository orderRepository, 
                               InventoryRepository inventoryRepository,
                               N8nService n8nService,
                               SystemConfigRepository configRepository,
                               DynamicConfigService dynamicConfigService) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.n8nService = n8nService;
        this.configRepository = configRepository;
        this.dynamicConfigService = dynamicConfigService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        var totalSales = orderRepository.totalSalesPaid();
        if (totalSales == null) totalSales = BigDecimal.ZERO;
        
        long pending = orderRepository.countPendingOrders();
        long lowStock = inventoryRepository.countLowStockProducts(10); 

        return ResponseEntity.ok(new DashboardSummary(totalSales, pending, lowStock));
    }

    @GetMapping("/automation/status")
    public ResponseEntity<Map<String, Boolean>> getAutomationStatus() {
        return ResponseEntity.ok(Map.of("enabled", n8nService.isAutomationEnabled()));
    }

    @PostMapping("/automation/toggle")
    public ResponseEntity<Map<String, String>> toggleAutomation(@RequestBody Map<String, Boolean> body) {
        boolean enable = Boolean.TRUE.equals(body.get("enabled"));
        
        // Persiste a configuração no banco
        SystemConfigEntity config = new SystemConfigEntity();
        config.setConfigKey("N8N_Automation_Enabled");
        config.setConfigValue(String.valueOf(enable));
        configRepository.save(config);
        
        // Atualiza cache em memória
        dynamicConfigService.refresh();

        String status = enable ? "ATIVADA" : "DESATIVADA";
        return ResponseEntity.ok(Map.of("message", "Automação n8n " + status));
    }

    @PostMapping("/automation/test-trigger")
    public ResponseEntity<String> testTrigger() {
        n8nService.sendLowStockAlert("PRODUTO TESTE DASHBOARD", 5, 10);
        return ResponseEntity.ok("Disparo de teste enviado (Verifique os logs ou o n8n)");
    }
}
