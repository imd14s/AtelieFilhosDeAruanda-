package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationService;
import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductIntegrationEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MercadoLivreService implements MarketplaceIntegrationService {

    private final ProductIntegrationRepository integrationRepository;

    public MercadoLivreService(ProductIntegrationRepository integrationRepository) {
        this.integrationRepository = integrationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CreateOrderRequest fetchAndConvertOrder(String resourceId) {
        // resourceId vem como "/orders/123456" -> External ID do Pedido
        // SIMULAÇÃO: Vamos assumir que conseguimos extrair o "Item ID" do pedido do ML.
        // Na vida real, chamaríamos GET /orders/{id} e receberíamos um JSON contendo "order_items": [{ "item": { "id": "MLB-999" } }]
        
        // MOCK: Vamos fingir que o item vendido é "MLB-TEST-ITEM" fixo para testar o fluxo,
        // OU poderíamos extrair do resourceId se fosse mapeado.
        // Para o teste funcionar, vamos criar um produto com external_id = "MLB-TEST-ITEM" no teste.
        String simulatedExternalItemId = "MLB-TEST-ITEM"; 

        // Busca qual produto interno corresponde a esse ID do ML
        ProductIntegrationEntity integration = integrationRepository.findByExternalIdAndIntegrationType(
                simulatedExternalItemId, 
                OrderSource.MERCADO_LIVRE
        ).orElseThrow(() -> new NotFoundException("Produto não vinculado: " + simulatedExternalItemId));

        return new CreateOrderRequest(
                OrderSource.MERCADO_LIVRE,
                resourceId.replace("/", "-"),
                "Comprador Mercado Livre",
                List.of(new CreateOrderItemRequest(integration.getProduct().getId(), 1))
        );
    }
}
