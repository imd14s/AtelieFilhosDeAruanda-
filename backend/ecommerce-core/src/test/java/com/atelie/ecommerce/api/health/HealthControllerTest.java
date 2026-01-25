package com.atelie.ecommerce.api.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TESTES (DDT/TDD) - Rota /health
 *
 * Contrato da rota:
 * - GET /health
 *   - 200 OK
 *   - Content-Type: text/plain
 *   - Body: "OK"
 *
 * - POST /health
 *   - 405 Method Not Allowed
 *
 * Nota DDT:
 * - Esses testes devem falhar enquanto a rota não existir (404).
 * - O objetivo é travar o contrato ANTES da implementação.
 */
@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Esperado:
     * - GET /health retorna 200 e body "OK".
     */
    @Test
    void shouldReturn200AndOkBody() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("OK"));
    }

    /**
     * Esperado:
     * - Content-Type compatível com text/plain.
     */
    @Test
    void shouldReturnTextPlainContentType() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/plain")));
    }

    /**
     * Esperado:
     * - POST /health não é permitido (405).
     */
    @Test
    void shouldReturn405WhenCallingPostOnHealth() throws Exception {
        mockMvc.perform(post("/health"))
                .andExpect(status().isMethodNotAllowed());
    }

    /**
     * Esperado:
     * - Chamadas repetidas continuam respondendo 200 "OK" (idempotente).
     */
    @Test
    void shouldReturnOkWhenCallingManyTimes() throws Exception {
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(get("/health"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("OK"));
        }
    }
}
