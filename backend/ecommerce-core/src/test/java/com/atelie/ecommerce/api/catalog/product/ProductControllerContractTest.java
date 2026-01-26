package com.atelie.ecommerce.api.catalog.product;

import org.springframework.test.context.ActiveProfiles;




import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")



class ProductControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateProductAndReturn201() throws Exception {
        // 1) cria categoria via API (nome único para não conflitar com outros testes no mesmo contexto)
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

        // 2) cria produto vinculado
        String productBody = """
            {
              "name": "Vela 7 dias - Branca",
              "description": "Vela premium para firmeza e oração.",
              "price": 29.90,
              "categoryId": "%s",
              "active": true
            }
        """.formatted(categoryId);

        mockMvc.perform(
                post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productBody)
        )
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Vela 7 dias - Branca"))
        .andExpect(jsonPath("$.description").value("Vela premium para firmeza e oração."))
        .andExpect(jsonPath("$.price").value(29.90))
        .andExpect(jsonPath("$.categoryId").value(categoryId))
        .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturn400WhenRequiredFieldsMissing() throws Exception {
        String body = """
            {
              "name": "Produto sem preço"
            }
        """;

        mockMvc.perform(
                post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void shouldReturn404WhenCategoryDoesNotExist() throws Exception {
        String body = """
            {
              "name": "Produto X",
              "description": "Desc",
              "price": 10.00,
              "categoryId": "00000000-0000-0000-0000-000000000000",
              "active": true
            }
        """;

        mockMvc.perform(
                post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isNotFound());
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
