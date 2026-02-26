package com.atelie.ecommerce.application.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceType;

import java.util.Map;

/**
 * Contrato de driver executável (implementação em código).
 * O driver é selecionado via driverKey armazenada no banco.
 */
public interface ServiceDriver {

    String driverKey();

    ServiceType serviceType();

    Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config);
}
