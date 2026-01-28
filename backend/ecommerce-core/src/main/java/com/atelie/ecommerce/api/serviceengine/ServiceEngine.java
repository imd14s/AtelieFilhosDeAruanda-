package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceProviderConfigGateway providerConfigGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;
    private final DriverRegistry driverRegistry;

    public ServiceEngine(ServiceProviderGateway providerGateway,
                         ServiceProviderConfigGateway providerConfigGateway,
                         ServiceRoutingRuleGateway routingRuleGateway,
                         DriverRegistry driverRegistry) {
        this.providerGateway = providerGateway;
        this.providerConfigGateway = providerConfigGateway;
        this.routingRuleGateway = routingRuleGateway;
        this.driverRegistry = driverRegistry;
    }

    public Optional<ServiceProvider> pickProvider(ServiceType type) {
        // Carrega regras (mesmo se o algoritmo ainda for simples)
        List<ServiceRoutingRule> rules = routingRuleGateway.findEnabledByTypeOrdered(type);

        // Fallback simples: primeiro provider habilitado por prioridade
        List<ServiceProvider> providers = providerGateway.findEnabledByTypeOrdered(type);
        if (providers == null || providers.isEmpty()) return Optional.empty();

        return Optional.of(providers.get(0));
    }
}
