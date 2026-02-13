package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MediaStorageService mediaStorageService;

    private CategoryEntity category;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        category = new CategoryEntity();
        category.setId(UUID.randomUUID());
        category.setName("Integration Test Category");
        category.setActive(true);
        categoryRepository.save(category);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_WithValidData_ShouldSucceed() throws Exception {
        ProductCreateRequest request = new ProductCreateRequest(
                "Test Product",
                "Description",
                new BigDecimal("99.90"),
                10,
                category.getId(),
                List.of(new ProductCreateRequest.ProductMediaItem("image1.jpg", "IMAGE", true)),
                List.of(), // variants
                true, // active
                List.of() // marketplaceIds
        );

        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Test Product"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadImage_ShouldSucceed() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes());

        com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity mockAsset = new com.atelie.ecommerce.infrastructure.persistence.media.MediaAssetEntity();
        mockAsset.setId(1L);
        mockAsset.setStorageKey("stored-image.jpg");

        given(mediaStorageService.upload(any(), any(), any(Boolean.class))).willReturn(mockAsset);

        mockMvc.perform(multipart("/api/products/upload-image")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mockAsset.getId().toString()))
                .andExpect(jsonPath("$.url").value("/api/media/public/" + mockAsset.getId()));
    }

    @Test
    void searchProducts_BySlug_ShouldReturnOne() throws Exception {
        ProductEntity product = new ProductEntity();
        product.setId(UUID.randomUUID());
        product.setName("Slug Product");
        product.setDescription("Desc");
        product.setPrice(BigDecimal.TEN);
        product.setStockQuantity(10); // Ensure valid state
        product.setCategory(category);
        product.setSlug("slug-product");
        product.setActive(true);
        productRepository.save(product);

        mockMvc.perform(get("/api/products")
                .param("slug", "slug-product"))
                .andExpect(status().isOk())
                // Adjust depending on whether it returns list or single object. Controller
                // returns Optional<Product> for slug search?
                // Checking controller: findBySlug returns Optional, map to ok/notFound. So it
                // returns single object.
                .andExpect(jsonPath("$.name").value("Slug Product"));
    }

    @Test
    void searchProducts_ByCategory_ShouldReturnList() throws Exception {
        ProductEntity product = new ProductEntity();
        product.setId(UUID.randomUUID());
        product.setName("Category Product");
        product.setDescription("Desc");
        product.setPrice(BigDecimal.TEN);
        product.setStockQuantity(10);
        product.setCategory(category);
        product.setActive(true);
        productRepository.save(product);

        mockMvc.perform(get("/api/products")
                .param("categoryId", category.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Category Product"));
    }
}
