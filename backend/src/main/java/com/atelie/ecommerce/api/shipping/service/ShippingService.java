package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.domain.shipping.factory.ShippingProviderFactory;
import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.atelie.ecommerce.application.service.shipping.ShippingRulesEngine;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ShippingService {

    private static final Logger log = LoggerFactory.getLogger(ShippingService.class);

    private final ShippingProviderFactory shippingFactory;
    private final ShippingRulesEngine rulesEngine;
    private final ServiceProviderJpaRepository providerRepository;

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public ShippingService(ShippingProviderFactory shippingFactory, ShippingRulesEngine rulesEngine,
            ServiceProviderJpaRepository providerRepository) {
        this.shippingFactory = shippingFactory;
        this.rulesEngine = rulesEngine;
        this.providerRepository = providerRepository;
    }

    @Cacheable(value = "shippingQuotes", key = "#rawCep + #items.hashCode()")
    public List<ShippingQuoteResponse> quote(String rawCep, BigDecimal subtotal, String forcedProvider,
            List<com.atelie.ecommerce.application.dto.shipping.ShippingQuoteRequest.ShippingItem> items) {

        List<String> providersToCalculate = new ArrayList<>();

        if (forcedProvider != null && !forcedProvider.isEmpty()) {
            providersToCalculate.add(forcedProvider);
        } else {
            var activeProviders = providerRepository.findByServiceTypeAndEnabledOrderByPriorityAsc(ServiceType.SHIPPING,
                    true);
            if (activeProviders.isEmpty()) {
                log.warn("[LOGISTICS] Nenhum provedor de frete ativo encontrado no banco de dados.");
                return List.of();
            }
            providersToCalculate.addAll(activeProviders.stream().map(p -> p.getCode()).toList());
        }

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

        var paramsBase = new com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingParams(
                rawCep, subtotal, domainItems, "default-tenant", ""); // providerName é sobrescrito infra

        log.info("[LOGISTICS] Iniciando orquestração assíncrona para {} provedores", providersToCalculate.size());

        List<CompletableFuture<com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingResult>> futures = providersToCalculate
                .stream()
                .map(providerName -> {
                    var params = new com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingParams(
                            paramsBase.destinationCep(), paramsBase.subtotal(), paramsBase.items(),
                            paramsBase.tenantId(), providerName);
                    return CompletableFuture
                            .supplyAsync(() -> shippingFactory.getStrategy(providerName).calculate(params))
                            .orTimeout(5, java.util.concurrent.TimeUnit.SECONDS)
                            .exceptionally(ex -> {
                                log.error("[LOGISTICS] Timeout ou erro crítico na estratégia {}: {}", providerName,
                                        ex.getMessage());
                                return (com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingResult) null;
                            });
                })
                .collect(Collectors.toList());

        List<ShippingQuoteResponse> options = new ArrayList<>();
        for (var future : futures) {
            var result = future.join();
            if (result != null && result.success()) {
                var paramResult = new com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingParams(
                        paramsBase.destinationCep(), paramsBase.subtotal(), paramsBase.items(), paramsBase.tenantId(),
                        result.providerName());
                var finalResult = rulesEngine.applyRules(result, paramResult);
                options.add(new ShippingQuoteResponse(
                        finalResult.providerName(),
                        finalResult.eligible(),
                        finalResult.freeShipping(),
                        finalResult.cost(),
                        finalResult.threshold(),
                        finalResult.appliedRuleName(),
                        finalResult.originalCost(),
                        finalResult.persuasiveMessage(),
                        finalResult.estimatedDays()));
            }
        }

        if (options.isEmpty()) {
            log.warn("[LOGISTICS] Todas as estratégias falharam ou retornaram inválido para o CEP {}.", rawCep);
        }

        return options;
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
