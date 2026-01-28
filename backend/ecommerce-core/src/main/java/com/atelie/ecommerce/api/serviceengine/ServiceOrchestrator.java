package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.engine.ResolvedProvider;
import com.atelie.ecommerce.domain.service.engine.ServiceContext;
import com.atelie.ecommerce.domain.service.engine.ServiceEngine;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class ServiceOrchestrator {

    private final ServiceEngine engine;
    private final ServiceProviderConfigGateway configGateway;
    private final DriverRegistry driverRegistry;

    public ServiceOrchestrator(
            ServiceEngine engine,
            ServiceProviderConfigGateway configGateway,
            DriverRegistry driverRegistry
    ) {
        this.engine = engine;
        this.configGateway = configGateway;
        this.driverRegistry = driverRegistry;
    }

    public ServiceResult execute(
            ServiceType type,
            Map<String, Object> request,
            String environment
    ) {

        Map<String, Object> attributes = new HashMap<>(request);

        ServiceContext ctx = new ServiceContext(
                "BR",
                BigDecimal.ZERO,
                attributes
        );

        ResolvedProvider resolved = engine.resolve(type, ctx);

        if (resolved == null || resolved.provider() == null) {
            return new ServiceResult(false, null, Map.of("error", "NO_PROVIDER_AVAILABLE"));
        }

        var provider = resolved.provider();

        String configJson = configGateway
                .findConfigJson(provider.code(), environment)
                .orElse("{}");

        var driver = driverRegistry
                .findByDriverKey(provider.driverKey())
                .orElse(null);

        if (driver == null) {
            return new ServiceResult(false, provider.code(), Map.of("error", "DRIVER_NOT_FOUND"));
        }

        Map<String, Object> config = JsonUtils.toMap(configJson);
        Map<String, Object> payload = driver.execute(request, config);

        return new ServiceResult(true, provider.code(), payload);
    }
}
