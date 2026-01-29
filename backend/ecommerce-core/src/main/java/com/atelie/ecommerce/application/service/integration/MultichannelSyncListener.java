package com.atelie.ecommerce.application.service.integration;

// CORREÇÃO: O pacote correto é ...catalog.event (sem .product)
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class MultichannelSyncListener {

    // Listener preparado para o futuro Motor de Integração via Dashboard.
    // Atualmente opera em modo "Silent" para não bloquear o fluxo principal.
    
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductSaved(ProductSavedEvent event) {
        log.debug("Evento de sync recebido para produto: {}. Aguardando configuração de canais no Dashboard.", event.productId());
    }
}
