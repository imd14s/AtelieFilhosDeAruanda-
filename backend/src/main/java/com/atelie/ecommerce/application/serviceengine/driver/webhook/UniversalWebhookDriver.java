package com.atelie.ecommerce.application.serviceengine.driver.webhook;

import com.atelie.ecommerce.application.serviceengine.driver.GenericWebhookDriver;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Driver Único para qualquer integração via Webhook.
 * Identificado no banco pela driver_key 'universal.webhook'.
 */
@Component
public class UniversalWebhookDriver extends GenericWebhookDriver {

    public UniversalWebhookDriver(RestTemplate restTemplate) {
        super(restTemplate);
    }

    @Override
    public String driverKey() {
        return "universal.webhook";
    }

    @Override
    public ServiceType serviceType() {
        // Vinculado ao tipo genérico, mas atende a qualquer chamado pelo Orchestrator via driver_key
        return ServiceType.GENERIC;
    }

    @Override
    public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
        return super.execute(request, config);
    }
}
