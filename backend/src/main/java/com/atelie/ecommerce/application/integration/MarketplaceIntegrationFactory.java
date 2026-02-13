package com.atelie.ecommerce.application.integration;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class MarketplaceIntegrationFactory {

    private final Map<String, IMarketplaceAdapter> adapters;

    public MarketplaceIntegrationFactory(List<IMarketplaceAdapter> adapterList) {
        this.adapters = adapterList.stream()
                .collect(Collectors.toMap(
                        adapter -> adapter.getProviderCode().toLowerCase(),
                        Function.identity(),
                        (existing, replacement) -> existing // Prevent issues if duplicate codes exist
                ));
    }

    public Optional<IMarketplaceAdapter> getAdapter(String providerCode) {
        if (providerCode == null)
            return Optional.empty();
        return Optional.ofNullable(adapters.get(providerCode.toLowerCase()));
    }
}
