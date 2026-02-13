package com.atelie.ecommerce.api.inventory;

import com.atelie.ecommerce.api.inventory.dto.InventoryAdjustmentRequest;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class InventoryControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private InventoryRepository inventoryRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository variantRepository;

        @Autowired
        private ObjectMapper objectMapper;

        private UUID variantId;
        private ProductEntity product;

        @BeforeEach
        void setUp() {
                inventoryRepository.deleteAll();
                productRepository.deleteAll();

                // Create a dummy product for FK constraints if necessary, depending on entity
                // definition
                // InventoryMovementEntity has ManyToOne to ProductEntity
                product = new ProductEntity(
                                null,
                                "Inventory Test Product",
                                "Desc",
                                BigDecimal.TEN,
                                null,
                                null,
                                true);
                product.setActive(true);
                productRepository.save(product);

                com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity variant = new com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity(
                                product,
                                "INV-TEST-SKU",
                                null,
                                BigDecimal.TEN,
                                10,
                                null,
                                true);
                // Assuming test context has variantRepository injected, which I need to add
                variantRepository.save(variant);
                variantId = variant.getId();
        }

        @Test
        @WithMockUser
        void adjustStock_ShouldUpdateBalance() throws Exception {
                // 1. Initial Balance should be 0
                mockMvc.perform(get("/api/inventory/" + variantId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.currentStock").value(0));

                // 2. Add Stock (IN)
                InventoryAdjustmentRequest inRequest = new InventoryAdjustmentRequest(
                                MovementType.IN,
                                10,
                                "Initial Supply",
                                "REF-001");

                mockMvc.perform(post("/api/inventory/" + variantId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(inRequest)))
                                .andExpect(status().isOk());

                // 3. Verify Balance is 10
                int stock = inventoryRepository.auditCalculatedStockByVariant(variantId);
                assertThat(stock).isEqualTo(10);

                mockMvc.perform(get("/api/inventory/" + variantId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.currentStock").value(10));

                // 4. Remove Stock (OUT)
                InventoryAdjustmentRequest outRequest = new InventoryAdjustmentRequest(
                                MovementType.OUT,
                                3,
                                "Correction",
                                "REF-002");

                mockMvc.perform(post("/api/inventory/" + variantId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(outRequest)))
                                .andExpect(status().isOk());

                // 5. Verify Balance is 7
                mockMvc.perform(get("/api/inventory/" + variantId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.currentStock").value(7));
        }
}
