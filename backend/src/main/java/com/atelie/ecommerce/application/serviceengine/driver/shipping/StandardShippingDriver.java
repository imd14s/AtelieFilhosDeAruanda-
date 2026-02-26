package com.atelie.ecommerce.application.serviceengine.driver.shipping;

import com.atelie.ecommerce.application.serviceengine.ServiceDriver;
import com.atelie.ecommerce.application.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class StandardShippingDriver implements ServiceDriver {

    @Override
    public String driverKey() { return "shipping.standard"; }

    @Override
    public ServiceType serviceType() { return ServiceType.SHIPPING; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        BigDecimal subtotal = DriverConfigReader.requireMoney(request.get("subtotal"), "subtotal");
        String cep = (String) request.getOrDefault("cep", "");

        BigDecimal rate = DriverConfigReader.requireBigDecimal(config, "rate");
        BigDecimal threshold = DriverConfigReader.requireBigDecimal(config, "free_threshold");
        String prefixes = DriverConfigReader.optionalString(config, "cep_prefixes", "");
        String providerName = DriverConfigReader.optionalString(config, "display_name", "Standard");

        boolean eligible = true;
        if (!prefixes.isBlank() && !cep.isBlank()) {
            String cepDigits = cep.replaceAll("\\D+", "");
            eligible = Arrays.stream(prefixes.split(","))
                    .map(String::trim)
                    .anyMatch(cepDigits::startsWith);
        }

        boolean free = subtotal.compareTo(threshold) >= 0;
        BigDecimal cost = (eligible && free) ? BigDecimal.ZERO : rate;

        Map<String, Object> response = new HashMap<>();
        response.put("provider", providerName);
        response.put("cost", cost);
        response.put("eligible", eligible);
        response.put("free_shipping", free);
        return response;
    }
}
