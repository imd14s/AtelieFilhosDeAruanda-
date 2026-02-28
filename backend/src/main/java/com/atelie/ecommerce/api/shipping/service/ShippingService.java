package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.domain.shipping.factory.ShippingProviderFactory;
import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.atelie.ecommerce.application.service.shipping.ShippingRulesEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ShippingService {

    private static final Logger log = LoggerFactory.getLogger(ShippingService.class);

    private final ShippingProviderFactory shippingFactory;
    private final ShippingRulesEngine rulesEngine;

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public ShippingService(ShippingProviderFactory shippingFactory, ShippingRulesEngine rulesEngine) {
        this.shippingFactory = shippingFactory;
        this.rulesEngine = rulesEngine;
    }

    @Cacheable(value = "shippingQuotes", key = "#rawCep + #items.hashCode()")
    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider,
            List<com.atelie.ecommerce.application.dto.shipping.ShippingQuoteRequest.ShippingItem> items) {

        String providerName = forcedProvider != null ? forcedProvider : "MELHOR_ENVIO";

        var domainItems = items.stream()
                .map(i -> new com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingItem(
                        i.getProductId(),
                        i.getVariantId(),
                        i.getQuantity(),
                        i.getWeight() != null ? i.getWeight() : BigDecimal.valueOf(0.5),
                        i.getLength() != null ? i.getLength() : BigDecimal.valueOf(10),
                        i.getHeight() != null ? i.getHeight() : BigDecimal.valueOf(10),
                        i.getWidth() != null ? i.getWidth() : BigDecimal.valueOf(10)))
                .toList();

        var params = new com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingParams(
                rawCep, subtotal, domainItems, "default-tenant", providerName);

        log.info("[LOGISTICS] Iniciando orquestração assíncrona para provedor: {}", providerName);

        // Orquestração assíncrona para suportar cotações simultâneas se necessário
        CompletableFuture<com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingResult> futureResult = CompletableFuture
                .supplyAsync(() -> shippingFactory.getStrategy(providerName).calculate(params))
                .orTimeout(5, java.util.concurrent.TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    log.error("[LOGISTICS] Timeout ou erro crítico na estratégia {}: {}", providerName,
                            ex.getMessage());
                    return null;
                });

        var result = futureResult.join();

        if (result == null || !result.success()) {
            log.warn("[LOGISTICS] Estratégia {} falhou ou expirou. Acionando contingência OFFLINE.", providerName);
            result = shippingFactory.getStrategy("OFFLINE").calculate(params);
        }

        // --- DYNAMIC RULES ENGINE INTERCEPT ---
        result = rulesEngine.applyRules(result, params);

        return new ShippingQuoteResponse(
                result.providerName(),
                result.eligible(),
                result.freeShipping(),
                result.cost(),
                result.threshold(),
                result.appliedRuleName(),
                result.originalCost(),
                result.persuasiveMessage());
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
