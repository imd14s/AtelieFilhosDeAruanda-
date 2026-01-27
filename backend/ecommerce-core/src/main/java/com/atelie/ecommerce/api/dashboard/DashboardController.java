package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.api.dashboard.dto.DashboardSummary;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public DashboardController(OrderRepository orderRepository, InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        var totalSales = orderRepository.totalSalesPaid();
        var pending = orderRepository.countPendingOrders();
        var lowStock = inventoryRepository.countLowStockProducts(5); // Alerta se < 5 itens

        return ResponseEntity.ok(new DashboardSummary(totalSales, pending, lowStock));
    }
}
