package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MercadoLivreServiceTest {

    @Mock
    private ProductIntegrationRepository integrationRepository;

    @InjectMocks
    private MercadoLivreService mercadoLivreService;

    @Test
    void shouldConvertOrderUsingIntegrationMapping() {
        // Setup
        UUID productId = UUID.randomUUID();
        ProductEntity product = new ProductEntity();
        product.setId(productId);

        ProductIntegrationEntity integration = new ProductIntegrationEntity(
                product, OrderSource.MERCADO_LIVRE, "MLB-TEST-ITEM", "SKU-123"
        );

        when(integrationRepository.findByExternalIdAndIntegrationType(eq("MLB-TEST-ITEM"), eq(OrderSource.MERCADO_LIVRE)))
                .thenReturn(Optional.of(integration));

        // Execute
        CreateOrderRequest request = mercadoLivreService.fetchAndConvertOrder("/orders/123");

        // Assert
        assertEquals(OrderSource.MERCADO_LIVRE, request.source());
        assertEquals(productId, request.items().get(0).productId());
    }

    @Test
    void shouldFailIfMappingNotFound() {
        when(integrationRepository.findByExternalIdAndIntegrationType(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> 
            mercadoLivreService.fetchAndConvertOrder("/orders/999")
        );
    }
}
