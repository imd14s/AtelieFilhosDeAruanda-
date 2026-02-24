package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RealProductCreateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    private UUID categoryId;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        CategoryEntity category = new CategoryEntity();
        category.setId(UUID.randomUUID());
        category.setName("Frontend Category");
        category.setActive(true);
        categoryRepository.save(category);
        this.categoryId = category.getId();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_WithFrontendPayload_ShouldFailInitially() throws Exception {
        // Payload matching 'CreateProductDTO' from frontend
        // Note: Field names mismatch Backend DTO (name vs title, etc)
        String frontendPayload = """
                {
                    "title": "Produto Teste Frontend",
                    "description": "Descrição do produto enviado pelo front",
                    "price": 120.50,
                    "stock": 50,
                    "category": "%s",
                    "active": true,
                    "media": [
                        { "url": "http://img.com/1.jpg", "type": "IMAGE", "isMain": true }
                    ],
                    "dimensions": {
                        "weight": 100,
                        "width": 10,
                        "height": 10,
                        "length": 10
                    },
                    "seo": {
                        "slug": "produto-teste-frontend",
                        "title": "SEO Title",
                        "tags": ["tag1", "tag2"]
                    }
                }
                """.formatted(categoryId.toString());

        org.springframework.mock.web.MockMultipartFile productPart = new org.springframework.mock.web.MockMultipartFile(
                "product",
                "",
                "application/json",
                frontendPayload.getBytes());

        mockMvc.perform(multipart("/api/products")
                .file(productPart)
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andDo(print())
                .andExpect(status().isCreated());
    }
}
