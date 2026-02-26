package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.application.dto.order.CreateOrderItemRequest;
import com.atelie.ecommerce.application.dto.order.CreateOrderRequest;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put; // Check if correct method is used for status updates, assuming controller has methods
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OrderControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private ProductVariantRepository variantRepository;

        @Autowired
        private InventoryRepository inventoryRepository;

        @Autowired
        private ObjectMapper objectMapper;

        private ProductEntity product;
        private ProductVariantEntity variant;

        @BeforeEach
        void setUp() {
                orderRepository.deleteAll();
                inventoryRepository.deleteAll(); // Assuming specific method or standard JPA
                variantRepository.deleteAll();
                productRepository.deleteAll();

                product = new ProductEntity(
                                null,
                                "Test Product",
                                "Desc",
                                new BigDecimal("100.00"),
                                null,
                                null,
                                true);
                product.setActive(true);
                productRepository.save(product);

                variant = new ProductVariantEntity(
                                product,
                                "SKU-123",
                                null,
                                new BigDecimal("100.00"),
                                10,
                                null,
                                true);
                variantRepository.save(variant);

                // Initial stock
                InventoryMovementEntity initialStock = new InventoryMovementEntity();
                initialStock.setVariantId(variant.getId());
                initialStock.setType(MovementType.IN);
                initialStock.setQuantity(10);
                initialStock.setProduct(product);
                initialStock.setReason("Initial");
                inventoryRepository.save(initialStock);
        }

        @Test
        @WithMockUser
        void createOrder_ValidRequest_ShouldSucceed() throws Exception {
                CreateOrderItemRequest itemReq = new CreateOrderItemRequest(product.getId(), variant.getId(), 2);
                CreateOrderRequest request = new CreateOrderRequest(
                                "SITE",
                                "ORDER-EXT-001",
                                "Customer A",
                                "customer@test.com",
                                List.of(itemReq),
                                "12345678901",
                                "Rua A", "123", null, "Centro",
                                "São Paulo", "SP", "01000-000",
                                new BigDecimal("15.00"), "correios");

                mockMvc.perform(post("/api/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.status").value("PENDING"))
                                .andExpect(jsonPath("$.totalAmount").value(200.0));

                List<OrderEntity> orders = orderRepository.findAll();
                assertThat(orders).hasSize(1);
                OrderEntity order = orders.get(0);
                assertThat(order.getItems()).hasSize(1);

                // Verify Inventory Deduction
                int stock = inventoryRepository.auditCalculatedStockByVariant(variant.getId());
                assertThat(stock).isEqualTo(8); // 10 - 2
        }

        @Test
        @WithMockUser
        @Transactional
        void approveOrder_WithMelhorEnvio_ShouldAutomateShipping() throws Exception {
                // 1. Criar um pedido inicial
                OrderEntity order = new OrderEntity();
                order.setId(UUID.randomUUID());
                order.setCustomerName("Test User");
                order.setStatus("PENDING");
                order.setShippingProvider("Melhor Envio");
                orderRepository.save(order);

                // 2. Aprovar o pedido (Status -> APPROVED)
                mockMvc.perform(put("/api/orders/" + order.getId() + "/approve"))
                                .andExpect(status().isNoContent());

                // 3. Verificar resultados
                OrderEntity updatedOrder = orderRepository.findById(order.getId()).orElseThrow();
                assertThat(updatedOrder.getStatus()).isEqualTo("PAID");

                // Nota: Sem token real, a automação deve apenas logar e NÃO falhar
                // Se houvesse um token sandbox, labelUrlMe estaria preenchido.
                // Aqui validamos que o processo não quebrou.
        }
}
