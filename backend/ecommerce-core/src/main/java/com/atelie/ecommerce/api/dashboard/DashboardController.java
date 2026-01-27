package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.api.dashboard.dto.DashboardSummary;
import com.atelie.ecommerce.application.service.integration.N8nService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final N8nService n8nService; // Injeção do novo serviço

    public DashboardController(OrderRepository orderRepository, 
                               InventoryRepository inventoryRepository,
                               N8nService n8nService) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.n8nService = n8nService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        var totalSales = orderRepository.totalSalesPaid();
        if (totalSales == null) totalSales = BigDecimal.ZERO;
        
        long pending = orderRepository.countPendingOrders();
        long lowStock = inventoryRepository.countLowStockProducts(10); 

        return ResponseEntity.ok(new DashboardSummary(totalSales, pending, lowStock));
    }

    // --- NOVA ROTA: Consultar Status da Automação ---
    @GetMapping("/automation/status")
    public ResponseEntity<Map<String, Boolean>> getAutomationStatus() {
        return ResponseEntity.ok(Map.of("enabled", n8nService.isAutomationEnabled()));
    }

    // --- NOVA ROTA: Ligar/Desligar Automação ---
    @PostMapping("/automation/toggle")
    public ResponseEntity<Map<String, String>> toggleAutomation(@RequestBody Map<String, Boolean> body) {
        boolean enable = body.get("enabled");
        n8nService.setAutomationStatus(enable);
        String status = enable ? "ATIVADA" : "DESATIVADA";
        return ResponseEntity.ok(Map.of("message", "Automação n8n " + status));
    }

    // --- ROTA DE TESTE (Para forçar um disparo sem esperar o estoque baixar) ---
    @PostMapping("/automation/test-trigger")
    public ResponseEntity<String> testTrigger() {
        n8nService.sendLowStockAlert("PRODUTO TESTE DASHBOARD", 5, 10);
        return ResponseEntity.ok("Disparo de teste enviado (Verifique os logs ou o n8n)");
    }
}