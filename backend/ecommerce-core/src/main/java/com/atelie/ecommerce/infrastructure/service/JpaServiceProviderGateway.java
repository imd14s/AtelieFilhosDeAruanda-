package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JpaServiceProviderGateway implements ServiceProviderGateway {

    private static final Logger log = LoggerFactory.getLogger(JpaServiceProviderGateway.class);

    private final ServiceProviderJpaRepository repo;
    private final DynamicConfigService dynamicConfigService;
    private final Clock clock;

    private final Map<String, List<ServiceProvider>> listCache = new ConcurrentHashMap<>();
    private final Map<String, ServiceProvider> codeCache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;

    public JpaServiceProviderGateway(
            ServiceProviderJpaRepository repo,
            DynamicConfigService dynamicConfigService,
            Clock clock
    ) {
        this.repo = repo;
        this.dynamicConfigService = dynamicConfigService;
        this.clock = clock;
    }

    private long ttlSeconds() {
        return dynamicConfigService.getLong(DynamicConfigService.CACHE_TTL_SECONDS_KEY, 300);
    }

    private void checkCache() {
        if (lastUpdate.equals(LocalDateTime.MIN)) return;

        LocalDateTime now = LocalDateTime.now(clock);
        if (now.isAfter(lastUpdate.plusSeconds(ttlSeconds()))) {
            refresh();
        }
    }

    @Override
    public void refresh() {
        listCache.clear();
        codeCache.clear();
        lastUpdate = LocalDateTime.now(clock);
        log.info("ServiceProviderGateway cache cleared.");
    }

    @Override
    public Optional<ServiceProvider> findByCode(ServiceType type, String code) {
        checkCache();

        String key = type.name() + ":" + code;
        if (codeCache.containsKey(key)) return Optional.of(codeCache.get(key));

        var result = repo.findByCode(code)
                .filter(e -> safeTypeEquals(type, e.getServiceType()))
                .map(this::toDomain);

        result.ifPresent(sp -> codeCache.put(key, sp));
        if (lastUpdate.equals(LocalDateTime.MIN)) lastUpdate = LocalDateTime.now(clock);

        return result;
    }

    @Override
    public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) {
        checkCache();

        if (listCache.containsKey(type.name())) return listCache.get(type.name());

        var result = repo.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());

        listCache.put(type.name(), result);
        if (lastUpdate.equals(LocalDateTime.MIN)) lastUpdate = LocalDateTime.now(clock);
        return result;
    }

    private ServiceProvider toDomain(ServiceProviderEntity e) {
        return new ServiceProvider(
                e.getId(),
                ServiceType.valueOf(e.getServiceType()),
                e.getCode(),
                e.getName(),
                e.isEnabled(),
                e.getPriority(),
                e.getDriverKey(),
                e.isHealthEnabled()
        );
    }

    private boolean safeTypeEquals(ServiceType expected, String raw) {
        try {
            return expected == ServiceType.valueOf(raw);
        } catch (Exception e) {
            return false;
        }
    }
}
