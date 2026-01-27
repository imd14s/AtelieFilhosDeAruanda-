package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.LinkIntegrationRequest;
import com.atelie.ecommerce.application.service.catalog.product.ProductIntegrationService;
import com.atelie.ecommerce.domain.order.OrderSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductIntegrationController.class)
class ProductIntegrationControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ProductIntegrationService integrationService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void shouldLinkProductSuccessfully() throws Exception {
        UUID productId = UUID.randomUUID();
        LinkIntegrationRequest request = new LinkIntegrationRequest(
                OrderSource.MERCADO_LIVRE, "MLB-999", "SKU-TEST"
        );

        mockMvc.perform(post("/api/products/{id}/integrations", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(integrationService).linkProduct(eq(productId), any(LinkIntegrationRequest.class));
    }
}
