package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class MercadoLivreService implements MarketplaceIntegrationService {

    private final ProductIntegrationRepository integrationRepository;
    private final DynamicConfigService configService;
    private final RestTemplate restTemplate;

    public MercadoLivreService(ProductIntegrationRepository integrationRepository,
                               DynamicConfigService configService,
                               RestTemplate restTemplate) {
        this.integrationRepository = integrationRepository;
        this.configService = configService;
        this.restTemplate = restTemplate;
    }

    @Override
    @Transactional(readOnly = true)
    public CreateOrderRequest fetchAndConvertOrder(String resourceId) {
        if (!configService.containsKey("ML_ENABLED") || !configService.requireBoolean("ML_ENABLED")) {
             throw new IllegalStateException("Integração Mercado Livre desativada.");
        }

        String token = configService.requireString("ML_ACCESS_TOKEN");
        log.info("Fetching ML Order: {} using Token suffix: ...{}", resourceId, token.length() > 5 ? token.substring(token.length()-5) : "xxx");

        // Implementação real viria aqui
        return null; 
    }
}
