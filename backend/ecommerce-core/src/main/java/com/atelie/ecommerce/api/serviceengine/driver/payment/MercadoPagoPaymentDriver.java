package com.atelie.ecommerce.api.serviceengine.driver.payment;

import com.atelie.ecommerce.api.serviceengine.ServiceDriver;
import com.atelie.ecommerce.domain.service.model.ServiceType;

import java.util.Map;

public class MercadoPagoPaymentDriver implements ServiceDriver {

    @Override
    public String driverKey() {
        return "payment.mercadopago";
    }

    @Override
    public ServiceType serviceType() {
        return ServiceType.PAYMENT;
    }

    @Override
    public Map<String, Object> execute(
            Map<String, Object> request,
            Map<String, Object> config
    ) {

        // aqui futuramente entra o SDK real
        return Map.of(
                "status", "created",
                "provider", "mercado_pago",
                "amount", request.get("amount"),
                "sandbox", config.get("sandbox")
        );
    }
}
