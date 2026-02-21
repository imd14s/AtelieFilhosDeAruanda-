package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShippingService {

    private final ServiceOrchestrator orchestrator;
    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public ShippingService(ServiceOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider,
            List<com.atelie.ecommerce.api.shipping.dto.ShippingQuoteRequest.ShippingItem> items) {
        Map<String, Object> request = new HashMap<>();
        request.put("cep", rawCep);
        request.put("subtotal", subtotal);
        request.put("items", items);
        if (forcedProvider != null)
            request.put("forced_provider", forcedProvider); // Suporte futuro

        ServiceResult result = orchestrator.execute(ServiceType.SHIPPING, request, activeProfile);

        if (!result.success()) {
            return new ShippingQuoteResponse("ERROR", false, false, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        Map<String, Object> payload = result.payload();

        // CORREÇÃO: Usa o providerCode do orquestrador ("LOGGI", "J3") como fonte da
        // verdade.
        // O fallback é o payload do driver.
        String providerName = result.providerCode() != null ? result.providerCode()
                : (String) payload.getOrDefault("provider", "UNKNOWN");

        return new ShippingQuoteResponse(
                providerName,
                (Boolean) payload.getOrDefault("eligible", false),
                (Boolean) payload.getOrDefault("free_shipping", false),
                toBigDecimal(payload.get("cost")),
                toBigDecimal(payload.get("threshold")));
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return BigDecimal.ZERO;
        if (val instanceof BigDecimal)
            return (BigDecimal) val;
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
