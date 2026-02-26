package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.application.serviceengine.DriverRegistry;
import com.atelie.ecommerce.application.serviceengine.ServiceDriver;
import com.atelie.ecommerce.application.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.domain.provider.RuleMatcher;
import com.atelie.ecommerce.domain.service.engine.DefaultServiceEngine;
import com.atelie.ecommerce.domain.service.engine.ServiceEngine;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ServiceEngineConfig {

    @Bean
    public RuleMatcher ruleMatcher() {
        return new RuleMatcher();
    }

    @Bean
    public DriverRegistry driverRegistry(List<ServiceDriver> drivers) {
        return new DriverRegistry(drivers);
    }

    @Bean
    public ServiceEngine domainServiceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway,
            RuleMatcher ruleMatcher
    ) {
        return new DefaultServiceEngine(providerGateway, routingRuleGateway, ruleMatcher);
    }

    @Bean
    public ServiceOrchestrator serviceOrchestrator(
            ServiceEngine engine,
            ServiceProviderConfigGateway configGateway,
            DriverRegistry driverRegistry
    ) {
        return new ServiceOrchestrator(engine, configGateway, driverRegistry);
    }
}
