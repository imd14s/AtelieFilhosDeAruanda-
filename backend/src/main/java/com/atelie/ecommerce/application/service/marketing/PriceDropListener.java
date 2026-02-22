package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.catalog.event.ProductSavedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceDropListener {

    private final ProductRepository productRepository;
    private final PriceDropNotificationService notificationService;

    @EventListener
    @Transactional
    public void onProductSaved(ProductSavedEvent event) {
        if (event.isNew()) {
            return; // Novos produtos não têm "queda" de preço em relação ao anterior
        }

        productRepository.findById(event.productId()).ifPresent(product -> {
            BigDecimal currentPrice = product.getPrice();
            BigDecimal lastNotifiedPrice = product.getLastNotifiedPrice();

            if (lastNotifiedPrice == null) {
                // Primeira vez rastreando esse produto
                product.setLastNotifiedPrice(currentPrice);
                productRepository.save(product);
                return;
            }

            // Verificar se houve queda de preço significativa (ex: > 0.05 centavos ou
            // qualquer queda)
            if (currentPrice.compareTo(lastNotifiedPrice) < 0) {
                log.info("Queda de preço detectada para o produto {}: {} -> {}. Iniciando notificações.",
                        product.getName(), lastNotifiedPrice, currentPrice);

                notificationService.notifyPriceDrop(product);

                // Atualizar o preço de referência para não notificar novamente a mesma queda
                product.setLastNotifiedPrice(currentPrice);
                productRepository.save(product);
            } else if (currentPrice.compareTo(lastNotifiedPrice) > 0) {
                // Se o preço subiu, apenas atualizamos a referência para detectar quedas
                // futuras desse novo patamar
                product.setLastNotifiedPrice(currentPrice);
                productRepository.save(product);
            }
        });
    }
}
