package com.atelie.ecommerce.api.analytics;

import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AnalyticsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        createTestData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboardMetrics_ShouldReturnCorrectData() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard")
                .param("period", "30d"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", is(2)))
                .andExpect(jsonPath("$.totalSales", is(300.0))) // 100 + 200
                .andExpect(jsonPath("$.activeProducts", is(2)))
                .andExpect(jsonPath("$.topProducts", hasSize(2)))
                .andExpect(jsonPath("$.topProducts[0].name", oneOf("Product A", "Product B")))
                .andExpect(jsonPath("$.salesByDate", not(empty())));
    }

    private void createTestData() {
        CategoryEntity category = new CategoryEntity();
        category.setName("Category 1");
        category.setId(UUID.randomUUID());
        category = categoryRepository.save(category);

        ProductEntity p1 = createProduct("Product A", category);
        ProductEntity p2 = createProduct("Product B", category);
        createProduct("Inactive Product", category).setActive(false);
        productRepository.save(p1); // Ensure active status update if needed

        // Order 1: Product A (Qty 1) - $100
        createOrder(p1, 1, new BigDecimal("100.00"), OrderStatus.PAID);

        // Order 2: Product B (Qty 2) - $200
        createOrder(p2, 2, new BigDecimal("200.00"), OrderStatus.DELIVERED);

        // Order 3: Pending (Should allow counting pending but not sales)
        createOrder(p1, 1, new BigDecimal("50.00"), OrderStatus.PENDING);
    }

    private ProductEntity createProduct(String name, CategoryEntity category) {
        ProductEntity p = new ProductEntity();
        p.setName(name);
        p.setStockQuantity(100);
        p.setPrice(BigDecimal.TEN);
        p.setCategory(category);
        p.setActive(true);
        return productRepository.save(p);
    }

    private void createOrder(ProductEntity product, int qty, BigDecimal total, OrderStatus status) {
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setStatus(status.name());
        order.setTotalAmount(total);
        order.setCreatedAt(java.time.Instant.now());
        order.setCustomerName("Customer");
        order = orderRepository.save(order);

        OrderItemEntity item = new OrderItemEntity();
        item.setOrder(order);
        item.setProduct(product);
        item.setProductName(product.getName());
        item.setQuantity(qty);
        item.setUnitPrice(total.divide(BigDecimal.valueOf(qty)));
        item.setTotalPrice(total);
        item.setId(UUID.randomUUID());

        orderItemRepository.save(item);
    }
}
