package com.atelie.ecommerce.api.catalog.category;

import com.atelie.ecommerce.api.catalog.category.dto.CreateCategoryRequest;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CategoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_Valid_ShouldSucceed() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("New Category");
        request.setActive(true);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("New Category"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_DuplicateName_ShouldThrowConflict() throws Exception {
        // Arrange: Persist existing category
        CategoryEntity existing = new CategoryEntity();
        existing.setId(UUID.randomUUID());
        existing.setName("Existing Category");
        existing.setActive(true);
        categoryRepository.save(existing);

        // Act: Try to create one with same name
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Existing Category"); // Duplicate
        request.setActive(true);

        // Assert: Expect 409 Conflict
        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}
