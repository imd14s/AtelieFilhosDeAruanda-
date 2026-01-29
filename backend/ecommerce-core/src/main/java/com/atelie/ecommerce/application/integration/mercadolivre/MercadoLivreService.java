package com.atelie.ecommerce.application.integration.mercadolivre;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.integration.MarketplaceIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductIntegrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

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
        // 1. Verifica se a integração está ativa no Banco
        if (!configService.containsKey("ML_ENABLED") || !configService.requireBoolean("ML_ENABLED")) {
             throw new IllegalStateException("Integração Mercado Livre desativada no Dashboard.");
        }

        // 2. Busca Token (Segurança Mutável)
        String token = configService.requireString("ML_ACCESS_TOKEN");
        
        System.out.println("Consultando API ML com token: " + token.substring(0, 5) + "...");

        // 3. Lógica Real (Exemplo simplificado para HTTP)
        // String url = "https://api.mercadolibre.com" + resourceId;
        // ... chamada restTemplate ...

        // Mock funcional para permitir fluxo sem quebrar
        return null; 
    }
}
