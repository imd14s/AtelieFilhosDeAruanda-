package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.engine.ResolvedProvider;
import com.atelie.ecommerce.domain.service.engine.ServiceContext;
import com.atelie.ecommerce.domain.service.engine.ServiceEngine;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class ServiceOrchestrator {

    private final ServiceEngine engine;
    private final ServiceProviderConfigGateway configGateway;
    private final DriverRegistry driverRegistry;

    public ServiceOrchestrator(
            ServiceEngine engine,
            ServiceProviderConfigGateway configGateway,
            DriverRegistry driverRegistry) {
        this.engine = engine;
        this.configGateway = configGateway;
        this.driverRegistry = driverRegistry;
    }

    public ServiceResult execute(
            ServiceType type,
            Map<String, Object> request,
            String environment) {
        BigDecimal value = BigDecimal.ZERO;
        if (request.containsKey("amount"))
            value = toBigDecimal(request.get("amount"));
        else if (request.containsKey("subtotal"))
            value = toBigDecimal(request.get("subtotal"));
        else if (request.containsKey("total"))
            value = toBigDecimal(request.get("total"));

        Map<String, Object> attributes = new HashMap<>(request);

        // Usa o país do request se existir, senão default BR
        String country = (String) attributes.getOrDefault("country", "BR");

        ServiceContext ctx = new ServiceContext(country, value, attributes);

        ResolvedProvider resolved = engine.resolve(type, ctx);

        if (resolved == null || resolved.provider() == null) {
            return new ServiceResult(false, null, Map.of("error", "NO_PROVIDER_AVAILABLE"), "NO_PROVIDER_AVAILABLE");
        }

        var provider = resolved.provider();
        String configJson = configGateway
                .findConfigJson(provider.code(), environment)
                .orElse("{}");

        var driver = driverRegistry
                .findByDriverKey(provider.driverKey())
                .orElse(null);

        if (driver == null) {
            return new ServiceResult(false, provider.code(), Map.of("error", "DRIVER_NOT_FOUND"), "DRIVER_NOT_FOUND");
        }

        Map<String, Object> config = JsonUtils.toMap(configJson);
        Map<String, Object> payload = driver.execute(request, config);

        // Se o driver reportar erro no payload (ex: timeout, recusado), propagamos como
        // falha.
        boolean driverSuccess = !Boolean.TRUE.equals(payload.get("error"));

        String error = !driverSuccess ? (String) payload.getOrDefault("error_message", "DRIVER_EXECUTION_FAILED")
                : null;
        return new ServiceResult(driverSuccess, provider.code(), payload, error);
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return BigDecimal.ZERO;
        if (val instanceof BigDecimal)
            return (BigDecimal) val;
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
