package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;

import java.util.List;

public class DefaultServiceEngine implements ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;

    public DefaultServiceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway
    ) {
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
    }

    @Override
    public ResolvedProvider resolve(ServiceType type, ServiceContext ctx) {

        List<ServiceRoutingRule> rules =
                routingRuleGateway.findEnabledByTypeOrdered(type);

        List<ServiceProvider> providers =
                providerGateway.findEnabledByTypeOrdered(type);

        if (providers == null || providers.isEmpty()) {
            return null;
        }

        return new ResolvedProvider(
                providers.get(0),
                "PRIORITY"
        );
    }
}
