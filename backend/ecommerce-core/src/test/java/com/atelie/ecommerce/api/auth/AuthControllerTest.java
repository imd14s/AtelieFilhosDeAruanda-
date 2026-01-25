package com.atelie.ecommerce.api.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TESTES (DDT/TDD) - Rotas de Autenticação (AUTH)
 *
 * Contrato planejado (controller):
 * - POST /auth/register
 *   - 201 Created
 *   - application/json
 *   - body contém: {"userId": "..."}
 *
 * - POST /auth/login
 *   - 200 OK
 *   - application/json
 *   - body contém: {"accessToken": "..."}
 *
 * - GET /auth/google/url
 *   - 200 OK
 *   - application/json
 *   - body contém: {"authUrl": "..."}
 *
 * Nota DDT:
 * - Sem implementação, hoje será 404 (falha controlada).
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateUserOnRegister() throws Exception {
        String payload = """
                {
                  "name": "Everson Dias",
                  "email": "everson@example.com",
                  "password": "12345678"
                }
                """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").isNotEmpty());
    }

    @Test
    void shouldLoginAndReturnAccessToken() throws Exception {
        String payload = """
                {
                  "email": "everson@example.com",
                  "password": "12345678"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void shouldReturnGoogleAuthUrl() throws Exception {
        mockMvc.perform(get("/auth/google/url"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.authUrl").isNotEmpty());
    }
}
