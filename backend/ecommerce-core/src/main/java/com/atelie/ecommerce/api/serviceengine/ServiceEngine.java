package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceProviderConfigGateway configGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;
    private final DriverRegistry registry;

    private final ObjectMapper mapper = new ObjectMapper();

    public ServiceEngine(ServiceProviderGateway providerGateway,
                         ServiceProviderConfigGateway configGateway,
                         ServiceRoutingRuleGateway routingRuleGateway,
                         DriverRegistry registry) {
        this.providerGateway = providerGateway;
        this.configGateway = configGateway;
        this.routingRuleGateway = routingRuleGateway;
        this.registry = registry;
    }

    /**
     * Executa um serviço selecionando provider via DB (prioridade/enable).
     * Regras avançadas (match/fallback) entram depois sem mudar o contrato.
     */
    public ServiceResult execute(ServiceType serviceType, Map<String, Object> request, String environment) {
        // (por enquanto) regras não influenciam, mas a porta já existe
        routingRuleGateway.findRulesJson(serviceType);

        List<ServiceProvider> providers = providerGateway.findByServiceType(serviceType).stream()
                .filter(ServiceProvider::enabled)
                .sorted(Comparator.comparingInt(ServiceProvider::priority))
                .toList();

        if (providers.isEmpty()) {
            return new ServiceResult(false, null, Map.of("error", "No enabled provider for service: " + serviceType));
        }

        ServiceProvider chosen = providers.get(0);

        ServiceDriver driver = registry.findByDriverKey(chosen.driverKey())
                .orElseThrow(() -> new IllegalStateException("Driver not found for driverKey=" + chosen.driverKey()));

        Map<String, Object> config = configGateway.findConfigJson(chosen.code(), environment)
                .map(this::parseJsonToMap)
                .orElse(Map.of());

        Map<String, Object> payload = driver.execute(request, config);
        return new ServiceResult(true, chosen.code(), payload);
    }

    private Map<String, Object> parseJsonToMap(String json) {
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Invalid provider config JSON", e);
        }
    }
}
