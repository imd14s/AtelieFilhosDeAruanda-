package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;

@Component
public class J3ShippingDriver implements ServiceDriver {

    @Override
    public String driverKey() { return "shipping.j3"; }

    @Override
    public ServiceType serviceType() { return ServiceType.SHIPPING; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String cep = (String) request.get("cep");
        BigDecimal subtotal = (BigDecimal) request.get("subtotal");

        // Leitura da config do banco (injetada pelo Orchestrator)
        BigDecimal rate = new BigDecimal(String.valueOf(config.getOrDefault("rate", "15.00")));
        BigDecimal threshold = new BigDecimal(String.valueOf(config.getOrDefault("free_threshold", "299.00")));
        String prefixes = (String) config.getOrDefault("cep_prefixes", "");

        // Lógica de Elegibilidade (Simples por prefixo)
        boolean eligible = true;
        if (!prefixes.isBlank()) {
            String cepDigits = cep.replaceAll("\\D+", "");
            eligible = Arrays.stream(prefixes.split(","))
                    .map(String::trim)
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
