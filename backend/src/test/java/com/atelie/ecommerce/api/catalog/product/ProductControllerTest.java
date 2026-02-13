package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository variantRepository;

    private UUID categoryId;

    @BeforeEach
    void setup() {
        variantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        CategoryEntity category = new CategoryEntity();
        category.setName("Test Category");
        category.setId(UUID.randomUUID());
        categoryId = categoryRepository.save(category).getId();
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void createProduct_ValidPayload_ShouldReturn200AndCreatedProduct() throws Exception {
        ProductCreateRequest request = new ProductCreateRequest(
                "Integration Product",
                "Desc",
                BigDecimal.valueOf(100.00),
                10,
                categoryId,
                new java.util.ArrayList<>(), // media
                new java.util.ArrayList<>(), // variants
                true, // active
                new java.util.ArrayList<>() // marketplaceIds
        );
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Integration Product")));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void updateProduct_ExistingProduct_ShouldUpdateAndReturn200() throws Exception {
        // Arrange
        ProductEntity existing = new ProductEntity();
        existing.setName("Old Name");
        existing.setPrice(BigDecimal.TEN);
        existing.setCategory(categoryRepository.findById(categoryId).get());
        ProductEntity saved = productRepository.save(existing);

        ProductEntity updatePayload = new ProductEntity();
        updatePayload.setName("Updated Name");
        updatePayload.setDescription("Updated Desc");
        updatePayload.setPrice(BigDecimal.valueOf(200.00));
        updatePayload.setStockQuantity(50);

        // Act & Assert
        mockMvc.perform(put("/api/products/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.price", is(200.00)));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void updateProduct_NonExistent_ShouldReturn404() throws Exception {
        ProductEntity updatePayload = new ProductEntity();
        updatePayload.setName("Ghost");

        mockMvc.perform(put("/api/products/" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isNotFound());
    }
}
