package com.atelie.ecommerce.application.listener;

import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductIntegrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class StockSyncListener {

    private static final Logger log = LoggerFactory.getLogger(StockSyncListener.class);
    private final ProductIntegrationRepository integrationRepository;

    public StockSyncListener(ProductIntegrationRepository integrationRepository) {
        this.integrationRepository = integrationRepository;
    }

    @EventListener
    // @Async removido temporariamente para facilitar teste unitário síncrono, ou configurar TaskExecutor depois
    public void handleInventoryChange(InventoryChangedEvent event) {
        var links = integrationRepository.findByProductId(event.productId());
        
        if (links.isEmpty()) {
            return;
        }

        links.forEach(link -> {
             log.info("SYNC: Enviando update para {}. Produto: {}, Novo Saldo: {}", 
                     link.getIntegrationType(), 
                     link.getExternalId(), 
                     event.newQuantity());
             // Todo: Injetar MarketplaceIntegrationService e chamar update
        });
    }
}
