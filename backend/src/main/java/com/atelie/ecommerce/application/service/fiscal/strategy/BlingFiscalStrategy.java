package com.atelie.ecommerce.application.service.fiscal.strategy;

import org.springframework.web.client.RestTemplate;
import java.util.UUID;

public class BlingFiscalStrategy extends AbstractFiscalStrategy {

    public BlingFiscalStrategy(RestTemplate restTemplate) {
        super(restTemplate);
    }

    @Override
    public String getProviderName() {
        return "Bling";
    }

    @Override
    public String emitInvoice(UUID orderId) {
        // TODO: Implementar chamada à API v3 do Bling
        return "BLING_PENDING_" + orderId;
    }

    @Override
    public String getInvoicePdfUrl(String externalReference) {
        // TODO: Buscar PDF via API do Bling
        return null;
    }
}
