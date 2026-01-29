package com.atelie.ecommerce.application.listener;

import com.atelie.ecommerce.application.integration.mercadolivre.MercadoLivreService;
import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class MultichannelSyncListener {

    private final ProductRepository productRepository;
    private final MercadoLivreService mercadoLivreService;

    public MultichannelSyncListener(ProductRepository productRepository, 
                                    MercadoLivreService mercadoLivreService) {
        this.productRepository = productRepository;
        this.mercadoLivreService = mercadoLivreService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductSaved(ProductSavedEvent event) {
        productRepository.findById(event.productId()).ifPresent(product -> {
            // Lógica REAL de Sincronia
            if (event.isNew()) {
                log.info("MULTICHANNEL: Tentando criar anúncio no Mercado Livre para: {}", product.getName());
                // Chamada REAL (Controlada por flag no Dashboard dentro do Service)
                mercadoLivreService.createListing(product);
            } else {
                log.info("MULTICHANNEL: Produto atualizado (Sync de estoque/preço pendente em futura implementação).");
            }
        });
    }
}
