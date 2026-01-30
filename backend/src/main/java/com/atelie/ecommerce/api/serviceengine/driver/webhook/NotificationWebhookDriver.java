package com.atelie.ecommerce.api.serviceengine.driver.webhook;

import com.atelie.ecommerce.api.serviceengine.driver.GenericWebhookDriver;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationWebhookDriver extends GenericWebhookDriver {
    public NotificationWebhookDriver(RestTemplate restTemplate) { super(restTemplate); }
    
    @Override public String driverKey() { return "universal.notification.webhook"; }
    @Override public ServiceType serviceType() { return ServiceType.NOTIFICATION; }
}
