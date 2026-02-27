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
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.application.service.payment.PaymentService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;

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

        @MockBean
        private OrderService orderService;

        @MockBean
        private PaymentService paymentService;

        @Test
        @org.springframework.security.test.context.support.WithMockUser(username = "user")
        void calculateShipping_ShouldReturnList() throws Exception {
                Map<String, Object> payload = Map.of(
                                "cep", "00000-000",
                                "subtotal", 100.00,
                                "items", Collections.emptyList());

                mockMvc.perform(post("/api/shipping/quote")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                                .andExpect(status().isOk());
        }

        @Test
        @org.springframework.security.test.context.support.WithMockUser(username = "user")
        void process_ShouldReturnStatus() throws Exception {
                UUID productId = UUID.randomUUID();
                Map<String, Object> payload = Map.of(
                                "customerName", "João",
                                "customerEmail", "joao@example.com",
                                "items", java.util.List.of(
                                                Map.of(
                                                                "productId", productId.toString(),
                                                                "quantity", 1)),
                                "shipping", Map.of(
                                                "street", "Rua A",
                                                "number", "123",
                                                "price", 10.0));

                com.atelie.ecommerce.application.dto.order.OrderResponse orderResponse = new com.atelie.ecommerce.application.dto.order.OrderResponse(
                                UUID.randomUUID(), com.atelie.ecommerce.domain.order.OrderStatus.PENDING, "STOREFRONT",
                                "ext-1", "João",
                                java.math.BigDecimal.valueOf(100), java.math.BigDecimal.TEN, "Rua A", "PAC", "pix",
                                "PENDING",
                                java.math.BigDecimal.ZERO, java.time.LocalDateTime.now(), Collections.emptyList(), null,
                                null, null, null, null, null,
                                "00000000000");

                Mockito.when(orderService.createOrder(Mockito.any())).thenReturn(orderResponse);

                com.atelie.ecommerce.application.dto.payment.PaymentResponse paymentResponse = new com.atelie.ecommerce.application.dto.payment.PaymentResponse(
                                "APPROVED", "pix", java.math.BigDecimal.valueOf(100), false, null);
                Mockito.when(paymentService.processPayment(
                                Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),
                                Mockito.any(), Mockito.any())).thenReturn(paymentResponse);

                mockMvc.perform(post("/api/checkout/process")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").exists());
        }
}
