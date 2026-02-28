package com.atelie.ecommerce.domain.shipping.factory;

import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ShippingProviderFactory {

    private final List<ShippingStrategy> strategies;

    public ShippingProviderFactory(List<ShippingStrategy> strategies) {
        this.strategies = strategies;
    }

    /**
     * Resolve a melhor estratégia baseada no nome do provedor.
     * Caso não encontre, pode retornar uma estratégia de contingência padrão.
     */
    public ShippingStrategy getStrategy(String providerName) {
        return strategies.stream()
                .filter(s -> s.supports(providerName))
                .findFirst()
                .orElseThrow(
                        () -> new RuntimeException("Nenhuma estratégia de frete disponível para: " + providerName));
    }
}
