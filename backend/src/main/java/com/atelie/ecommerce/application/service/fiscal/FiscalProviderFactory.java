package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.application.service.config.SystemConfigService;
import com.atelie.ecommerce.application.service.fiscal.nfe.NfeEmissionOrchestrator;
import com.atelie.ecommerce.application.service.fiscal.strategy.*;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.domain.fiscal.model.FiscalProvider;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.FiscalIntegrationRepository;
import com.atelie.ecommerce.infrastructure.security.EncryptionUtility;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FiscalProviderFactory {

    private final FiscalIntegrationRepository repository;
    private final Map<String, AbstractFiscalStrategy> strategies = new HashMap<>();

    public FiscalProviderFactory(FiscalIntegrationRepository repository,
            RestTemplate restTemplate,
            OrderService orderService,
            NfeEmissionOrchestrator orchestrator,
            SystemConfigService configService,
            EncryptionUtility encryptionUtility) {
        this.repository = repository;

        // Registrar as estratégias disponíveis
        strategies.put("bling", new BlingFiscalStrategy(restTemplate));
        strategies.put("tiny", new TinyFiscalStrategy(restTemplate));
        strategies.put("enotas", new ENotasFiscalStrategy(restTemplate));
        strategies.put("sefaz",
                new SefazFiscalStrategy(restTemplate, orderService, orchestrator, configService, encryptionUtility));
    }

    public Optional<FiscalProvider> getActiveProvider() {
        return repository.findByActiveTrue()
                .map(entity -> {
                    AbstractFiscalStrategy strategy = strategies.get(entity.getProviderName().toLowerCase());
                    if (strategy != null) {
                        strategy.setCredentials(entity.getApiKey(), entity.getApiUrl());
                    }
                    return strategy;
                });
    }
}
