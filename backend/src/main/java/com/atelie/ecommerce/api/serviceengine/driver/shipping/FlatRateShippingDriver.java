package com.atelie.ecommerce.api.serviceengine.driver.shipping;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.api.serviceengine.util.DriverConfigReader;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class FlatRateShippingDriver implements ServiceDriver {

    @Override
    public String driverKey() { return "shipping.flat_rate"; }

    @Override
    public ServiceType serviceType() { return ServiceType.SHIPPING; }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        BigDecimal subtotal = DriverConfigReader.requireMoney(request.get("subtotal"), "subtotal");

        // 100% vindo do config_json (dashboard/db). Sem defaults escondidos.
        BigDecimal rate = DriverConfigReader.requireBigDecimal(config, "rate");
        BigDecimal threshold = DriverConfigReader.requireBigDecimal(config, "free_threshold");

        boolean free = subtotal.compareTo(threshold) >= 0;
        BigDecimal cost = free ? BigDecimal.ZERO : rate;

        Map<String, Object> response = new HashMap<>();
        response.put("provider", "FLAT_RATE");
        response.put("cost", cost);
        response.put("eligible", true);
        response.put("free_shipping", free);
        response.put("threshold", threshold);
        return response;
    }
}
