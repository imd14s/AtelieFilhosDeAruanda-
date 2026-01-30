package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class J3ShippingDriver implements ServiceDriver {

    @Override
    public String driverKey() { return "shipping.j3"; }

    @Override
    public ServiceType serviceType() { return ServiceType.SHIPPING; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String cep = DriverConfigReader.requireNonBlank((String) request.get("cep"), "cep");
        BigDecimal subtotal = DriverConfigReader.requireMoney(request.get("subtotal"), "subtotal");

        // 100% vindo do config_json (dashboard/db). Sem defaults escondidos.
        BigDecimal rate = DriverConfigReader.requireBigDecimal(config, "rate");
        BigDecimal threshold = DriverConfigReader.requireBigDecimal(config, "free_threshold");
        String prefixes = DriverConfigReader.optionalString(config, "cep_prefixes", "");

        boolean eligible = true;
        if (!prefixes.isBlank()) {
            String cepDigits = cep.replaceAll("\\D+", "");
            eligible = Arrays.stream(prefixes.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .anyMatch(cepDigits::startsWith);
        }

        boolean free = subtotal.compareTo(threshold) >= 0;
        BigDecimal cost = (eligible && free) ? BigDecimal.ZERO : rate;

        Map<String, Object> response = new HashMap<>();
        response.put("provider", "J3");
        response.put("cost", cost);
        response.put("eligible", eligible);
        response.put("free_shipping", free);
        response.put("threshold", threshold);
        return response;
    }
}
