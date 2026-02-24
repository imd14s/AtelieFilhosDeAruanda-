package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.application.service.fiscal.strategy.AbstractFiscalStrategy;
import com.atelie.ecommerce.application.service.fiscal.strategy.BlingFiscalStrategy;
import com.atelie.ecommerce.application.service.fiscal.strategy.ENotasFiscalStrategy;
import com.atelie.ecommerce.application.service.fiscal.strategy.TinyFiscalStrategy;
import com.atelie.ecommerce.domain.fiscal.model.FiscalProvider;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.FiscalIntegrationRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FiscalIntegrationEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FiscalProviderFactory {

    private final FiscalIntegrationRepository repository;
    private final Map<String, AbstractFiscalStrategy> strategies = new HashMap<>();

    public FiscalProviderFactory(FiscalIntegrationRepository repository, RestTemplate restTemplate) {
        this.repository = repository;

        // Registrar as estratégias disponíveis
        strategies.put("bling", new BlingFiscalStrategy(restTemplate));
        strategies.put("tiny", new TinyFiscalStrategy(restTemplate));
        strategies.put("enotas", new ENotasFiscalStrategy(restTemplate));
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
