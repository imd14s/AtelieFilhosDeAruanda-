package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JpaServiceProviderGateway implements ServiceProviderGateway {

    private final ServiceProviderJpaRepository repo;
    
    // Cache Simples
    private final Map<String, List<ServiceProvider>> listCache = new ConcurrentHashMap<>();
    private final Map<String, ServiceProvider> codeCache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;
    private static final long TTL_MINUTES = 5;

    public JpaServiceProviderGateway(ServiceProviderJpaRepository repo) {
        this.repo = repo;
    }

    private void checkCache() {
        if (LocalDateTime.now().isAfter(lastUpdate.plusMinutes(TTL_MINUTES))) {
            listCache.clear();
            codeCache.clear();
            lastUpdate = LocalDateTime.now();
        }
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
        return result;
    }

    private ServiceProvider toDomain(ServiceProviderEntity e) {
        return new ServiceProvider(e.getId(), ServiceType.valueOf(e.getServiceType()), e.getCode(), e.getName(), e.isEnabled(), e.getPriority(), e.getDriverKey(), e.isHealthEnabled());
    }

    private boolean safeTypeEquals(ServiceType expected, String raw) {
        try { return expected == ServiceType.valueOf(raw); } catch (Exception e) { return false; }
    }
}
