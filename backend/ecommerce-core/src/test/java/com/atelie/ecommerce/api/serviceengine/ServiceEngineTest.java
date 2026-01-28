package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ServiceEngineTest {

    @Test
    void shouldSelectFirstEnabledProviderByPriority_andExecuteDriver() {
        // gateways fakes
        ServiceProviderGateway providerGateway = serviceType -> List.of(
                new ServiceProvider("J3", "shipping.j3", true, 1),
                new ServiceProvider("CORREIOS", "shipping.correios", true, 2)
        );

        ServiceProviderConfigGateway configGateway = (providerCode, env) ->
                Optional.of("{\"rate\": 13.00, \"freeShippingMin\": 199.90}");

        ServiceRoutingRuleGateway routingRuleGateway = serviceType -> List.of(); // sem regras por enquanto

        // driver registry fake
        DriverRegistry registry = new DriverRegistry(List.of(new StubDriver()));

        ServiceEngine engine = new ServiceEngine(providerGateway, configGateway, routingRuleGateway, registry);

        ServiceResult result = engine.execute(ServiceType.SHIPPING, Map.of("zip", "01001000"), "prod");

        assertTrue(result.success());
        assertEquals("J3", result.providerCode());
        assertEquals("ok", result.payload().get("status"));
    }

    static class StubDriver implements ServiceDriver {
        @Override public String driverKey() { return "shipping.j3"; }
        @Override public ServiceType serviceType() { return ServiceType.SHIPPING; }

        @Override
        public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
            return Map.of("status", "ok", "usedRate", config.get("rate"));
        }
    }
}
