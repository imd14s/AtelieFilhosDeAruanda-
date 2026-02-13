package com.atelie.ecommerce.application.listener;

import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class MultichannelSyncListener {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MultichannelSyncListener.class);

    private final ProductRepository productRepository;

    public MultichannelSyncListener(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductSaved(ProductSavedEvent event) {
        productRepository.findById(event.productId()).ifPresent(product -> {
            // Lógica REAL de Sincronia agora é tratada no ProductService via
            // syncMarketplaces()
            if (event.isNew()) {
                log.info("MULTICHANNEL: Produto criado: {}. Sync handled by ProductService.", product.getName());
            } else {
                log.info("MULTICHANNEL: Produto atualizado: {}. Sync handled by ProductService.", product.getName());
            }
        });
    }
}
