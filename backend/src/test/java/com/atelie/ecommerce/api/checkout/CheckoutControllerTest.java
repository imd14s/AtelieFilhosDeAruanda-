package com.atelie.ecommerce.api.checkout;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CheckoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "user")
    void calculateShipping_ShouldReturnList() throws Exception {
        Map<String, Object> payload = Map.of("cep", "00000-000", "items", Collections.emptyList());

        mockMvc.perform(post("/api/checkout/calculate-shipping")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "user")
    void process_ShouldReturnStatus() throws Exception {
        Map<String, Object> payload = Map.of("cartId", "123");

        mockMvc.perform(post("/api/checkout/process")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());
    }
}
