package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;

    public ServiceEngine(ServiceProviderGateway providerGateway,
                         ServiceRoutingRuleGateway routingRuleGateway) {
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
    }

    public Optional<ServiceProvider> pickProvider(ServiceType type) {
        // já carrega regras (mesmo que a estratégia ainda seja simples)
        List<ServiceRoutingRule> rules = routingRuleGateway.findEnabledByTypeOrdered(type);

        // fallback simples: primeiro provider habilitado por prioridade
        List<ServiceProvider> providers = providerGateway.findEnabledByTypeOrdered(type);
        if (providers == null || providers.isEmpty()) return Optional.empty();

        return Optional.of(providers.get(0));
    }
}
