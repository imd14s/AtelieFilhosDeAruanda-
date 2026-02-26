package com.atelie.ecommerce.api.payment;

import com.atelie.ecommerce.application.dto.payment.PaymentResponse;
import com.atelie.ecommerce.application.service.payment.PaymentService;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @Test
    @WithMockUser
    void createPixPayment_ShouldReturnResponse() throws Exception {
        // Arrange
        CreatePixPaymentRequest request = new CreatePixPaymentRequest(
                UUID.randomUUID(),
                "test@example.com",
                "12345678909",
                new BigDecimal("100.00"));

        PaymentResponse response = new PaymentResponse(
                "approved",
                "mercadopago",
                new BigDecimal("100.00"),
                true,
                Map.of("qr_code", "mock-qr-code"));

        given(paymentService.createPixPayment(any(CreatePixPaymentRequest.class))).willReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/payments/pix")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("approved"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.metadata.qr_code").value("mock-qr-code"));
    }
}
