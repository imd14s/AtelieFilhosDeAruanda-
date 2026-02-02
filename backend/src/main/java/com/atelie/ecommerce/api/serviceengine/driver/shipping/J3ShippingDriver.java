package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Driver J3: 100% dependente da Config Table 'service_provider_configs'.
 */
@Component
public class J3ShippingDriver implements ServiceDriver {

    @Override
    public String driverKey() { return "shipping.j3"; }

    @Override
    public ServiceType serviceType() { return ServiceType.SHIPPING; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        // Dados da requisição
        String cep = DriverConfigReader.requireNonBlank((String) request.get("cep"), "cep");
        BigDecimal subtotal = DriverConfigReader.requireMoney(request.get("subtotal"), "subtotal");

        // Configurações vindas do Banco (Config Table) - Zero Hardcode
        BigDecimal rate = DriverConfigReader.requireBigDecimal(config, "rate");
        BigDecimal threshold = DriverConfigReader.requireBigDecimal(config, "free_threshold");
        
        // Se 'cep_prefixes' for nulo, consideramos que atende todo o Brasil
        String prefixes = DriverConfigReader.optionalString(config, "cep_prefixes", "");

        boolean eligible = true;
        if (!prefixes.isBlank()) {
            String cepDigits = cep.replaceAll("\\D+", "");
            eligible = Arrays.stream(prefixes.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .anyMatch(cepDigits::startsWith);
        }

        // Regra de Frete Grátis baseada no limite da Config Table
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
