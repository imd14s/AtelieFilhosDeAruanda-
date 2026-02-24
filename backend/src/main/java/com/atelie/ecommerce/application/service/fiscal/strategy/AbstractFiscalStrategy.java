package com.atelie.ecommerce.application.service.fiscal.strategy;

import com.atelie.ecommerce.domain.fiscal.model.FiscalProvider;
import org.springframework.web.client.RestTemplate;

public abstract class AbstractFiscalStrategy implements FiscalProvider {

    protected final RestTemplate restTemplate;
    protected String apiKey;
    protected String apiUrl;

    protected AbstractFiscalStrategy(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void setCredentials(String apiKey, String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }
}
