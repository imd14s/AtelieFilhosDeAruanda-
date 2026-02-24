package com.atelie.ecommerce.application.service.fiscal.strategy;

import org.springframework.web.client.RestTemplate;
import java.util.UUID;

public class TinyFiscalStrategy extends AbstractFiscalStrategy {

    public TinyFiscalStrategy(RestTemplate restTemplate) {
        super(restTemplate);
    }

    @Override
    public String getProviderName() {
        return "Tiny";
    }

    @Override
    public String emitInvoice(UUID orderId) {
        // TODO: Implementar chamada à API do Tiny
        return "TINY_PENDING_" + orderId;
    }

    @Override
    public String getInvoicePdfUrl(String externalReference) {
        return null;
    }
}
