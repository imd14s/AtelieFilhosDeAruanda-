package com.atelie.ecommerce.application.listener;

import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
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

    public MultichannelSyncListener(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductSaved(ProductSavedEvent event) {
        productRepository.findById(event.productId()).ifPresent(product -> {
            log.info("MULTICHANNEL: Detectada alteração no produto '{}' (Novo: {}). Iniciando sincronia...", 
                    product.getName(), event.isNew());

            // Lógica Simulada de Sincronia
            // 1. Verificar se o produto tem flag "sincronizar_automaticamente"
            // 2. Buscar integrações ativas (Mercado Livre, Shopee)
            // 3. Chamar APIs externas
            
            if (event.isNew()) {
                log.info("MULTICHANNEL: Criando anúncio no Mercado Livre para SKU: {}", product.getId());
                // mercadoLivreService.createListing(product);
            } else {
                log.info("MULTICHANNEL: Atualizando preço/estoque na Shopee e TikTok.");
            }
        });
    }
}
