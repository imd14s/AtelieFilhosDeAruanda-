package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.serviceengine.DriverRegistry;
import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.ServiceEngine;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ServiceEngineConfig {

    @Bean
    public DriverRegistry driverRegistry(List<ServiceDriver> drivers) {
        return new DriverRegistry(drivers);
    }

    @Bean
    public ServiceEngine serviceEngine(ServiceProviderGateway providerGateway,
                                      ServiceProviderConfigGateway configGateway,
                                      ServiceRoutingRuleGateway routingRuleGateway,
                                      DriverRegistry registry) {
        return new ServiceEngine(providerGateway, configGateway, routingRuleGateway, registry);
    }
}
