package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ServiceEngineTest {

    @Test
    void shouldReturnEmptyWhenNoProviders() {
        ServiceProviderGateway providerGateway = new ServiceProviderGateway() {
            @Override public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) { return List.of(); }
            @Override public Optional<ServiceProvider> findByCode(ServiceType type, String code) { return Optional.empty(); }
        };

        ServiceProviderConfigGateway configGateway = (providerCode, environment) -> Optional.empty();

        ServiceRoutingRuleGateway ruleGateway = new ServiceRoutingRuleGateway() {
            @Override public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) { return List.of(); }
        };

        DriverRegistry driverRegistry = new DriverRegistry(List.of());

        ServiceEngine engine = new ServiceEngine(providerGateway, configGateway, ruleGateway, driverRegistry);

        Optional<ServiceProvider> picked = engine.pickProvider(ServiceType.SHIPPING);
        assertTrue(picked.isEmpty());
    }

    @Test
    void shouldPickFirstProviderByPriorityOrder() {
        ServiceProvider p1 = new ServiceProvider(
                UUID.randomUUID(),
                ServiceType.SHIPPING,
                "J3",
                "J3 Transportadora",
                true,
                1,
                "shipping.j3",
                false
        );

        ServiceProvider p2 = new ServiceProvider(
                UUID.randomUUID(),
                ServiceType.SHIPPING,
                "ML",
                "Mercado Livre",
                true,
                2,
                "shipping.ml",
                false
        );

        ServiceProviderGateway providerGateway = new ServiceProviderGateway() {
            @Override public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) { return List.of(p1, p2); }
            @Override public Optional<ServiceProvider> findByCode(ServiceType type, String code) { return Optional.empty(); }
        };

        ServiceProviderConfigGateway configGateway = (providerCode, environment) -> Optional.empty();

        ServiceRoutingRuleGateway ruleGateway = new ServiceRoutingRuleGateway() {
            @Override public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) { return List.of(); }
        };

        DriverRegistry driverRegistry = new DriverRegistry(List.of());

        ServiceEngine engine = new ServiceEngine(providerGateway, configGateway, ruleGateway, driverRegistry);

        Optional<ServiceProvider> picked = engine.pickProvider(ServiceType.SHIPPING);
        assertTrue(picked.isPresent());
        assertEquals("J3", picked.get().code());
    }
}
