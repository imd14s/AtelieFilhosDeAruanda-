package com.atelie.ecommerce.api;

import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.boot.test.mock.mockito.MockBean;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class StorefrontIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private com.atelie.ecommerce.api.shipping.service.ShippingService shippingService;

        @Test
        void healthCheck_ShouldReturnUp() throws Exception {
                mockMvc.perform(get("/api/health"))
                                .andExpect(status().isOk())
                                .andExpect(content().string("OK"));
        }

        @Test
        void shippingQuote_WithValidData_ShouldReturnQuote() throws Exception {
                ShippingQuoteRequest request = new ShippingQuoteRequest();
                request.setCep("04571010");
                request.setSubtotal(new BigDecimal("100.00"));

                // Mock legitimate response
                com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse mockResponse = new com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse(
                                "MOCK", true, false, BigDecimal.TEN, BigDecimal.TEN);

                org.mockito.Mockito
                                .when(shippingService.quote(org.mockito.ArgumentMatchers.any(),
                                                org.mockito.ArgumentMatchers.any(),
                                                org.mockito.ArgumentMatchers.any(),
                                                org.mockito.ArgumentMatchers.any()))
                                .thenReturn(mockResponse);

                mockMvc.perform(post("/api/shipping/quote")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk());
        }

        @Test
        void shippingQuote_InvalidCep_ShouldReturnBadRequest() throws Exception {
                String invalidJson = "{\"zipCode\": \"\", \"items\": []}";

                mockMvc.perform(post("/api/shipping/quote")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson))
                                .andExpect(status().isBadRequest());
        }
}
