package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShippingService {

    private static final Logger log = LoggerFactory.getLogger(ShippingService.class);

    private final ServiceOrchestrator orchestrator;
    private final ServiceProviderGateway providerGateway;

    public ShippingService(ServiceOrchestrator orchestrator, ServiceProviderGateway providerGateway) {
        this.orchestrator = orchestrator;
        this.providerGateway = providerGateway;
    }

    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider,
            List<com.atelie.ecommerce.api.shipping.dto.ShippingQuoteRequest.ShippingItem> items) {

        String cep = rawCep.replaceAll("\\D", "");
        Map<String, Object> request = new HashMap<>();
        request.put("cep", cep);
        request.put("subtotal", subtotal);
        request.put("items", items);

        if (forcedProvider != null) {
            request.put("forced_provider", forcedProvider);
        }

        List<ServiceProvider> providers = providerGateway.findEnabledByTypeOrdered(ServiceType.SHIPPING);
        List<Map<String, Object>> allOptions = new ArrayList<>();

        String mainProviderName = "Nenhum disponível";
        boolean anyEligible = false;
        BigDecimal bestCost = null;

        for (ServiceProvider p : providers) {
            if (forcedProvider != null && !p.code().equals(forcedProvider))
                continue;

            log.debug("[DEBUG] Cotando frete com provedor: {}", p.code());
            ServiceResult result = orchestrator.executeWithProvider(p, request, "PRODUCTION");

            if (result.success()) {
                Map<String, Object> payload = result.payload();
                boolean eligible = (Boolean) payload.getOrDefault("eligible", false);

                if (eligible) {
                    anyEligible = true;

                    // Se o driver retornar múltiplas opções (ex: Melhor Envio)
                    if (payload.containsKey("options") && payload.get("options") instanceof List) {
                        List<Map<String, Object>> driverOptions = (List<Map<String, Object>>) payload.get("options");
                        for (Map<String, Object> opt : driverOptions) {
                            Map<String, Object> consolidatedOpt = new HashMap<>(opt);
                            consolidatedOpt.put("provider_code", p.code());
                            allOptions.add(consolidatedOpt);
                        }
                    } else {
                        // Opção única (ex: J3 Flex)
                        Map<String, Object> opt = new HashMap<>();
                        opt.put("name", payload.getOrDefault("provider", p.name()));
                        opt.put("price", payload.get("cost"));
                        opt.put("delivery_time", payload.get("delivery_time"));
                        opt.put("free_shipping", payload.getOrDefault("free_shipping", false));
                        opt.put("provider_code", p.code());
                        allOptions.add(opt);
                    }
                }
            } else {
                log.warn("[DEBUG] Falha ao cotar frete para provedor {}: {}", p.code(), result.error());
            }
        }

        if (allOptions.isEmpty() && providers.isEmpty()) {
            return new ShippingQuoteResponse("CONFIG_MISSING", false, false, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        if (!allOptions.isEmpty()) {
            // Ordenar por preço
            allOptions.sort((a, b) -> toBigDecimal(a.get("price")).compareTo(toBigDecimal(b.get("price"))));

            Map<String, Object> first = allOptions.get(0);
            mainProviderName = (String) first.get("name");
            bestCost = toBigDecimal(first.get("price"));
        }

        ShippingQuoteResponse response = new ShippingQuoteResponse(
                mainProviderName,
                anyEligible,
                false,
                bestCost,
                null);
        response.setOptions(allOptions);

        return response;
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return BigDecimal.ZERO;
        if (val instanceof BigDecimal)
            return (BigDecimal) val;
        if (val instanceof Number)
            return BigDecimal.valueOf(((Number) val).doubleValue());
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
