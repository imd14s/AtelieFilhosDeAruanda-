package com.atelie.ecommerce.api.dashboard;

import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private OrderRepository orderRepository;
    @MockBean private InventoryRepository inventoryRepository;

    @Test
    void shouldReturnDashboardMetrics() throws Exception {
        when(orderRepository.totalSalesPaid()).thenReturn(new BigDecimal("1500.50"));
        when(orderRepository.countPendingOrders()).thenReturn(3L);
        when(inventoryRepository.countLowStockProducts(5)).thenReturn(2L);

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSales").value(1500.50))
                .andExpect(jsonPath("$.pendingOrders").value(3))
                .andExpect(jsonPath("$.lowStockAlerts").value(2));
    }
}
