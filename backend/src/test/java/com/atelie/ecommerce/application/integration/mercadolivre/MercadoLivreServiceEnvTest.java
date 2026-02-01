package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MercadoLivreServiceEnvTest {

    @Test
    void shouldUseMlApiBaseUrlFromEnvWhenFetchingOrder() {
        ProductIntegrationRepository repo = mock(ProductIntegrationRepository.class);
        DynamicConfigService configService = mock(DynamicConfigService.class);
        RestTemplate restTemplate = mock(RestTemplate.class);

        MockEnvironment env = new MockEnvironment();
        env.setProperty("ML_API_BASE_URL", "https://example-ml.local");

        when(configService.containsKey("ML_SYNC_ENABLED")).thenReturn(true);
        when(configService.requireBoolean("ML_SYNC_ENABLED")).thenReturn(true);
        when(configService.requireString("ML_ACCESS_TOKEN")).thenReturn("token");

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);

        // Não precisamos de JSON real aqui. Basta capturar a URL e retornar um body nulo para forçar erro rápido.
        when(restTemplate.exchange(
            urlCaptor.capture(),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(com.fasterxml.jackson.databind.JsonNode.class)
        )).thenReturn(ResponseEntity.ok(null));

        MercadoLivreService service = new MercadoLivreService(repo, configService, restTemplate, env);

        // Deve lançar RuntimeException "Empty response from ML"
        assertThrows(RuntimeException.class, () -> service.fetchAndConvertOrder("123"));

        assertEquals("https://example-ml.local/orders/123", urlCaptor.getValue());
    }

    @Test
    void shouldUseMlCategoryDefaultFromEnvWhenCreatingListing() {
        ProductIntegrationRepository repo = mock(ProductIntegrationRepository.class);
        DynamicConfigService configService = mock(DynamicConfigService.class);
        RestTemplate restTemplate = mock(RestTemplate.class);

        MockEnvironment env = new MockEnvironment();
        env.setProperty("ML_API_BASE_URL", "https://example-ml.local");
        env.setProperty("ML_CATEGORY_DEFAULT", "MLB9999");

        when(configService.containsKey("ML_SYNC_ENABLED")).thenReturn(true);
        when(configService.requireBoolean("ML_SYNC_ENABLED")).thenReturn(true);
        when(configService.requireString("ML_ACCESS_TOKEN")).thenReturn("token");

        ProductEntity product = new ProductEntity();
        product.setName("Produto X");
        product.setPrice(new BigDecimal("10.00"));
        product.setStockQuantity(2);
        product.setImageUrl(null);

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);

        // Como o método engole exceção, vamos apenas simular falha e depois verificar capturas.
        when(restTemplate.postForEntity(
            urlCaptor.capture(),
            entityCaptor.capture(),
            eq(com.fasterxml.jackson.databind.JsonNode.class)
        )).thenThrow(new RuntimeException("network down"));

        MercadoLivreService service = new MercadoLivreService(repo, configService, restTemplate, env);

        // Não lança: método captura exceção internamente
        service.createListing(product);

        assertEquals("https://example-ml.local/items", urlCaptor.getValue());

        Object body = entityCaptor.getValue().getBody();
        assertNotNull(body);
        assertTrue(body instanceof Map);

        Map<?, ?> payload = (Map<?, ?>) body;
        assertEquals("MLB9999", payload.get("category_id"));
    }
}
