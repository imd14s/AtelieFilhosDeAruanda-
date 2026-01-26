package com.atelie.ecommerce.api.catalog.category;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CategoryControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateCategoryAndReturn201() throws Exception {
        String body = """
            {
              "name": "Guias Espirituais",
              "active": true
            }
        """;

        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Guias Espirituais"))
        .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturn409WhenCategoryAlreadyExists() throws Exception {
        String body = """
            {
              "name": "Velas",
              "active": true
            }
        """;

        // cria primeira vez
        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isCreated());

        // cria segunda vez -> conflito
        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("Conflict"));
    }
}
