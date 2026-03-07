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

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.atelie.ecommerce.application.service.order.OrderService orderService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.atelie.ecommerce.application.service.payment.PaymentService paymentService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.atelie.ecommerce.application.service.payment.MercadoPagoCustomerClient mpCustomerClient;

    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "user")
    void process_ShouldReturnStatusBadRequest_WhenItemsMissing() throws Exception {
        Map<String, Object> payload = Map.of("cartId", "123");

        mockMvc.perform(post("/api/checkout/process")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
