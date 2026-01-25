package com.atelie.ecommerce.api.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TESTES (DDT/TDD) - Contrato avançado da rota /health
 *
 * Contrato:
 * - GET /health
 *   - 200
 *   - text/plain
 *   - body "OK"
 *   - sem redirecionamento
 *
 * - Métodos não suportados (PUT/PATCH/DELETE) em /health => 405
 *
 * Nota DDT:
 * - Sem implementação, hoje será 404 (falha controlada).
 */
@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldNotRedirectOnHealth() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(redirectedUrl(null))
                .andExpect(content().string("OK"));
    }

    @Test
    void shouldReturnTextPlainCharsetUtf8() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));
    }

    @Test
    void shouldReturn405ForPut() throws Exception {
        mockMvc.perform(put("/health"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturn405ForPatch() throws Exception {
        mockMvc.perform(patch("/health"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void shouldReturn405ForDelete() throws Exception {
        mockMvc.perform(delete("/health"))
                .andExpect(status().isMethodNotAllowed());
    }
}
