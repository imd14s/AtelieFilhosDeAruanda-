package com.atelie.ecommerce.application.integration;



import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;

public interface MarketplaceIntegrationService {
    /**
     * Recebe um ID de notificação/recurso externo, busca os detalhes na loja
     * e converte para nosso formato de pedido interno.
     */
    CreateOrderRequest fetchAndConvertOrder(String resourceId);
}
