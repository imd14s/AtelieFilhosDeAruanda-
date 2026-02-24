package com.atelie.ecommerce.application.service.fiscal.strategy;

import org.springframework.web.client.RestTemplate;
import java.util.UUID;

public class ENotasFiscalStrategy extends AbstractFiscalStrategy {

    public ENotasFiscalStrategy(RestTemplate restTemplate) {
        super(restTemplate);
    }

    @Override
    public String getProviderName() {
        return "eNotas";
    }

    @Override
    public String emitInvoice(UUID orderId) {
        // TODO: Implementar chamada à API do eNotas
        return "ENOTAS_PENDING_" + orderId;
    }

    @Override
    public String getInvoicePdfUrl(String externalReference) {
        return null;
    }
}
