package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.domain.shipping.factory.ShippingProviderFactory;
import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShippingService {

    private static final Logger log = LoggerFactory.getLogger(ShippingService.class);

    private final ShippingProviderFactory shippingFactory;

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public ShippingService(ShippingProviderFactory shippingFactory) {
        this.shippingFactory = shippingFactory;
    }

    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider,
            List<com.atelie.ecommerce.application.dto.shipping.ShippingQuoteRequest.ShippingItem> items) {

        String providerName = forcedProvider != null ? forcedProvider : "MELHOR_ENVIO"; // Default fallback

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
                rawCep, subtotal, domainItems, "default-tenant");

        log.info("[LOGISTICS] Resolvendo estratégia para provedor: {}", providerName);
        var strategy = shippingFactory.getStrategy(providerName);
        var result = strategy.calculate(params);

        if (!result.success()) {
            log.warn("[LOGISTICS] Estratégia {} falhou: {}. Tentando contingência offline.", providerName,
                    result.error());
            result = shippingFactory.getStrategy("OFFLINE").calculate(params);
        }

        return new ShippingQuoteResponse(
                result.providerName(),
                result.eligible(),
                result.freeShipping(),
                result.cost(),
                result.threshold());
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
