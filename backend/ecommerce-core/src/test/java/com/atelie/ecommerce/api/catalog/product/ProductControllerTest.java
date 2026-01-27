package com.atelie.ecommerce.api.catalog.product;

import com.atelie.ecommerce.api.catalog.product.dto.CreateProductRequest;
import com.atelie.ecommerce.api.catalog.product.dto.ProductResponse;
import com.atelie.ecommerce.api.common.error.GlobalExceptionHandler;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.catalog.product.ProductService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService service;

    @Test
    void shouldReturn201WhenCreateProductSuccessfully() throws Exception {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        ProductResponse response = new ProductResponse(
                productId,
                "Vela 7 dias - Branca",
                "Vela premium para firmeza e oração.",
                new BigDecimal("29.90"),
                categoryId,
                true
        );

        when(service.create(ArgumentMatchers.any(CreateProductRequest.class))).thenReturn(response);

        String body = """
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
                        .content(body)
        )
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.id").value(productId.toString()))
        .andExpect(jsonPath("$.name").value("Vela 7 dias - Branca"))
        .andExpect(jsonPath("$.description").value("Vela premium para firmeza e oração."))
        .andExpect(jsonPath("$.price").value(29.90))
        .andExpect(jsonPath("$.categoryId").value(categoryId.toString()))
        .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturn400WhenValidationFails() throws Exception {
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
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void shouldReturn404WhenServiceThrowsNotFound() throws Exception {
        UUID categoryId = UUID.fromString("00000000-0000-0000-0000-000000000000");

        when(service.create(ArgumentMatchers.any(CreateProductRequest.class)))
                .thenThrow(new NotFoundException("Category not found"));

        String body = """
            {
              "name": "Produto X",
              "description": "Desc",
              "price": 10.00,
              "categoryId": "%s",
              "active": true
            }
        """.formatted(categoryId);

        mockMvc.perform(
                post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.error").value("Not Found"))
        .andExpect(jsonPath("$.message").value("Category not found"));
    }
}
