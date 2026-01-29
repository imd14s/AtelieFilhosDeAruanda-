package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JpaServiceProviderConfigGateway implements ServiceProviderConfigGateway {

    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceProviderConfigJpaRepository configRepo;
    
    private final Map<String, String> cache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;

    public JpaServiceProviderConfigGateway(ServiceProviderJpaRepository providerRepo,
                                           ServiceProviderConfigJpaRepository configRepo) {
        this.providerRepo = providerRepo;
        this.configRepo = configRepo;
    }

    @Override
    public Optional<String> findConfigJson(String providerCode, String environment) {
        // Cache com TTL (Fallback)
        if (LocalDateTime.now().isAfter(lastUpdate.plusMinutes(5))) {
            refresh();
        }

        String key = providerCode + ":" + environment;
        if (cache.containsKey(key)) return Optional.of(cache.get(key));

        UUID providerId = providerRepo.findByCode(providerCode).map(p -> p.getId()).orElse(null);
        if (providerId == null) return Optional.empty();

        Optional<String> json = configRepo.findTopByProviderIdAndEnvironmentOrderByVersionDesc(providerId, environment)
                .map(c -> c.getConfigJson());
        
        json.ifPresent(j -> cache.put(key, j));
        return json;
    }

    @Override
    public void refresh() {
        cache.clear();
        lastUpdate = LocalDateTime.now();
        System.out.println("ServiceProviderConfig cache cleared.");
    }
}
