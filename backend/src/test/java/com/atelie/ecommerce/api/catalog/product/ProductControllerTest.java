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
import java.util.ArrayList;
import java.util.UUID;
import com.atelie.ecommerce.domain.catalog.product.ProductionType;
import com.atelie.ecommerce.domain.catalog.product.ProductOrigin;

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
                                null, // originalPrice
                                10,
                                categoryId,
                                new ArrayList<>(), // media
                                new ArrayList<>(), // variants
                                true, // active
                                BigDecimal.valueOf(1.0), // weight
                                BigDecimal.valueOf(1.0), // height
                                BigDecimal.valueOf(1.0), // width
                                BigDecimal.valueOf(1.0), // length
                                new ArrayList<>(), // marketplaceIds
                                "6109.10.00",
                                ProductionType.REVENDA,
                                ProductOrigin.NACIONAL);
                org.springframework.mock.web.MockMultipartFile productPart = new org.springframework.mock.web.MockMultipartFile(
                                "product",
                                "",
                                "application/json",
                                objectMapper.writeValueAsString(request).getBytes());

                mockMvc.perform(multipart("/api/products")
                                .file(productPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id", notNullValue()))
                                .andExpect(jsonPath("$.title", is("Integration Product")));
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

                ProductCreateRequest updatePayload = new ProductCreateRequest(
                                "Updated Name",
                                "Updated Desc",
                                BigDecimal.valueOf(200.00),
                                null,
                                50,
                                categoryId,
                                new ArrayList<>(),
                                new ArrayList<>(),
                                true,
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                new ArrayList<>(),
                                "6109.10.00",
                                ProductionType.REVENDA,
                                ProductOrigin.NACIONAL);

                // Act & Assert
                org.springframework.mock.web.MockMultipartFile updatePart = new org.springframework.mock.web.MockMultipartFile(
                                "product",
                                "",
                                "application/json",
                                objectMapper.writeValueAsString(updatePayload).getBytes());

                mockMvc.perform(multipart("/api/products/" + saved.getId())
                                .file(updatePart)
                                .with(request -> {
                                        request.setMethod("PUT");
                                        return request;
                                })
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title", is("Updated Name")))
                                .andExpect(jsonPath("$.price", is(200.00)));
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        void updateProduct_NonExistent_ShouldReturn404() throws Exception {
                ProductCreateRequest updatePayload = new ProductCreateRequest(
                                "Ghost",
                                "Ghost Desc",
                                BigDecimal.valueOf(100.00),
                                null,
                                10,
                                categoryId,
                                new ArrayList<>(),
                                new ArrayList<>(),
                                true,
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                BigDecimal.valueOf(1.0),
                                new ArrayList<>(),
                                "6109.10.00",
                                ProductionType.REVENDA,
                                ProductOrigin.NACIONAL);

                org.springframework.mock.web.MockMultipartFile updateGhostPart = new org.springframework.mock.web.MockMultipartFile(
                                "product",
                                "",
                                "application/json",
                                objectMapper.writeValueAsString(updatePayload).getBytes());

                mockMvc.perform(multipart("/api/products/" + UUID.randomUUID())
                                .file(updateGhostPart)
                                .with(request -> {
                                        request.setMethod("PUT");
                                        return request;
                                })
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isNotFound());
        }
}
