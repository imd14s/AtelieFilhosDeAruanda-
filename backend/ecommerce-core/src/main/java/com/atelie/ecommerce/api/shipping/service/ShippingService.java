package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ShippingService {

    private final ServiceOrchestrator orchestrator;
    
    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public ShippingService(ServiceOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider) {
        Map<String, Object> request = new HashMap<>();
        request.put("cep", rawCep);
        request.put("subtotal", subtotal);
        
        // Agora usa o profile real (prod/dev/test) em vez de hardcoded
        ServiceResult result = orchestrator.execute(ServiceType.SHIPPING, request, activeProfile);

        if (!result.success()) {
            return new ShippingQuoteResponse("ERROR", false, false, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        Map<String, Object> payload = result.payload();
        return new ShippingQuoteResponse(
            (String) payload.getOrDefault("provider", "UNKNOWN"),
            (Boolean) payload.getOrDefault("eligible", false),
            (Boolean) payload.getOrDefault("free_shipping", false),
            payload.get("cost") instanceof BigDecimal ? (BigDecimal) payload.get("cost") : new BigDecimal(payload.get("cost").toString()),
            payload.get("threshold") instanceof BigDecimal ? (BigDecimal) payload.get("threshold") : new BigDecimal(payload.get("threshold").toString())
        );
    }
}
