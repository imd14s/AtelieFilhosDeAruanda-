package com.atelie.ecommerce.api.catalog.category;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@AutoConfigureMockMvc
class CategoryControllerListContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListCategoriesAndReturn200() throws Exception {
        // 1) cria categoria via API (nome único pra não conflitar)
        String categoryName = "Velas-" + UUID.randomUUID();

        String categoryBody = """
            {
              "name": "%s",
              "active": true
            }
        """.formatted(categoryName);

        String categoryResponse = mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryBody)
        )
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();

        String categoryId = extractJsonValue(categoryResponse, "id");

        // 2) lista categorias
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                // garante que a lista contém a categoria criada (sem depender de ordem)
                .andExpect(jsonPath("$..id", hasItem(categoryId)))
                .andExpect(jsonPath("$..name", hasItem(categoryName)))
                .andExpect(jsonPath("$..active", hasItem(true)));
    }

    /**
     * Extrai valor simples de uma chave JSON (sem depender de libs extras).
     * Ex: {"id":"abc"} -> extractJsonValue(json,"id") = abc
     */
    private static String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int idx = json.indexOf(pattern);
        if (idx < 0) return null;
        int start = json.indexOf('"', idx + pattern.length());
        int end = json.indexOf('"', start + 1);
        if (start < 0 || end < 0) return null;
        return json.substring(start + 1, end);
    }
}
