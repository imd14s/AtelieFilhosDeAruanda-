package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.serviceengine.DriverRegistry;
import com.atelie.ecommerce.api.serviceengine.ServiceEngine;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceEngineConfig {

    @Bean
    public ServiceEngine serviceEngine(ServiceProviderGateway providerGateway,
                                       ServiceProviderConfigGateway providerConfigGateway,
                                       ServiceRoutingRuleGateway routingRuleGateway,
                                       DriverRegistry driverRegistry) {
        return new ServiceEngine(providerGateway, providerConfigGateway, routingRuleGateway, driverRegistry);
    }
}
