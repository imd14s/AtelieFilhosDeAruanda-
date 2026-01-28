package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.engine.DefaultServiceEngine;
import com.atelie.ecommerce.domain.service.engine.ServiceEngine;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceEngineConfig {

    @Bean
    public ServiceEngine serviceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway
    ) {
        return new DefaultServiceEngine(
                providerGateway,
                routingRuleGateway
        );
    }
}
