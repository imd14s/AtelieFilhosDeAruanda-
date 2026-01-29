package com.atelie.ecommerce.application.listener;

import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class StockSyncListener {

    private static final Logger log = LoggerFactory.getLogger(StockSyncListener.class);
    private final ProductIntegrationRepository integrationRepository;

    public StockSyncListener(ProductIntegrationRepository integrationRepository) {
        this.integrationRepository = integrationRepository;
    }

    // CORREÇÃO: TransactionalEventListener garante que só executamos se o banco confirmou a transação.
    // O @Async garante que não travamos a thread original após o commit.
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInventoryChange(InventoryChangedEvent event) {
        var links = integrationRepository.findByProductId(event.productId());
        if (links.isEmpty()) {
            return;
        }

        links.forEach(link -> {
             log.info("SYNC [CONFIRMADO]: Enviando update para {}. Produto: {}, Novo Saldo: {}", 
                     link.getIntegrationType(), 
                     link.getExternalId(), 
                     event.newQuantity());
             // Lógica de envio HTTP
        });
    }
}
