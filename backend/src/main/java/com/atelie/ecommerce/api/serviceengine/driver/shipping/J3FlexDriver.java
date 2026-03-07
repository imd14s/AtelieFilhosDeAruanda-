package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.application.service.shipping.J3FlexCepService;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class J3FlexDriver implements ServiceDriver {

    private final J3FlexCepService cepService;

    public J3FlexDriver(J3FlexCepService cepService) {
        this.cepService = cepService;
    }

    @Override
    public String driverKey() {
        return "shipping.j3flex";
    }

    @Override
    public ServiceType serviceType() {
        return ServiceType.SHIPPING;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        String cep = (String) request.getOrDefault("cep", "");
        boolean eligible = cepService.isEligible(cep);

        if (!eligible) {
            Map<String, Object> response = new HashMap<>();
            response.put("eligible", false);
            response.put("provider", "J3 Flex");
            return response;
        }

        BigDecimal cost = DriverConfigReader.requireBigDecimal(config, "cost");
        // Previsão de entrega em dias úteis
        String deliveryDaysStr = DriverConfigReader.optionalString(config, "delivery_days", "3");
        int deliveryDays = Integer.parseInt(deliveryDaysStr);
        String providerName = DriverConfigReader.optionalString(config, "display_name", "J3 Flex");

        Map<String, Object> response = new HashMap<>();
        response.put("provider", providerName);
        response.put("cost", cost);
        response.put("eligible", true);
        response.put("delivery_time", deliveryDays); // Consistência com outros drivers
        response.put("free_shipping", false);

        return response;
    }
}
