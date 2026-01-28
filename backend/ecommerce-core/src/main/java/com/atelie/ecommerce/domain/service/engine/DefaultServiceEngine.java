package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;

public class DefaultServiceEngine implements ServiceEngine {

    private final ServiceProviderGateway providers;
    private final ServiceRoutingRuleGateway rules;

    public DefaultServiceEngine(ServiceProviderGateway providers, ServiceRoutingRuleGateway rules) {
        this.providers = providers;
        this.rules = rules;
    }

    @Override
    public ResolvedProvider resolve(ServiceType type, ServiceContext ctx) {
        throw new UnsupportedOperationException("Not implemented yet (DDT/TDD).");
    }
}
