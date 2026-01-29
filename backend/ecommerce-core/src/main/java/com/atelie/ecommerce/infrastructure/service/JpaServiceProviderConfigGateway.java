package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JpaServiceProviderConfigGateway implements ServiceProviderConfigGateway {

    private static final Logger log = LoggerFactory.getLogger(JpaServiceProviderConfigGateway.class);

    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceProviderConfigJpaRepository configRepo;
    private final DynamicConfigService dynamicConfigService;
    private final Clock clock;

    private final Map<String, String> cache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;

    public JpaServiceProviderConfigGateway(
            ServiceProviderJpaRepository providerRepo,
            ServiceProviderConfigJpaRepository configRepo,
            DynamicConfigService dynamicConfigService,
            Clock clock
    ) {
        this.providerRepo = providerRepo;
        this.configRepo = configRepo;
        this.dynamicConfigService = dynamicConfigService;
        this.clock = clock;
    }

    private long ttlSeconds() {
        return dynamicConfigService.getLong(DynamicConfigService.CACHE_TTL_SECONDS_KEY, 300);
    }

    private void checkCache() {
        if (lastUpdate.equals(LocalDateTime.MIN)) return;
        if (LocalDateTime.now(clock).isAfter(lastUpdate.plusSeconds(ttlSeconds()))) {
            refresh();
        }
    }

    @Override
    public Optional<String> findConfigJson(String providerCode, String environment) {
        checkCache();

        String key = providerCode + ":" + environment;
        if (cache.containsKey(key)) return Optional.of(cache.get(key));

        UUID providerId = providerRepo.findByCode(providerCode).map(p -> p.getId()).orElse(null);
        if (providerId == null) return Optional.empty();

        Optional<String> json = configRepo
                .findTopByProviderIdAndEnvironmentOrderByVersionDesc(providerId, environment)
                .map(c -> c.getConfigJson());

        json.ifPresent(j -> cache.put(key, j));
        if (lastUpdate.equals(LocalDateTime.MIN)) lastUpdate = LocalDateTime.now(clock);
        return json;
    }

    @Override
    public void refresh() {
        cache.clear();
        lastUpdate = LocalDateTime.now(clock);
        log.info("ServiceProviderConfig cache cleared.");
    }
}
