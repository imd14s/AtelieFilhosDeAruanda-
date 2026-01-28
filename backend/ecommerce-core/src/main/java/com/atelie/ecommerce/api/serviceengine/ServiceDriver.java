package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.ServiceType;

import java.util.Map;

/**
 * Driver técnico (imutável e raro).
 * Ex: driverKey="shipping.j3", driverKey="payment.mercadopago".
 */
public interface ServiceDriver {
    String driverKey();
    ServiceType serviceType();

    Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config);
}
