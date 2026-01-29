package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JpaServiceRoutingRuleGateway implements ServiceRoutingRuleGateway {

    private static final Logger log = LoggerFactory.getLogger(JpaServiceRoutingRuleGateway.class);

    private final ServiceRoutingRuleJpaRepository repo;
    private final DynamicConfigService dynamicConfigService;
    private final Clock clock;

    private final Map<String, List<ServiceRoutingRule>> cache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;

    public JpaServiceRoutingRuleGateway(ServiceRoutingRuleJpaRepository repo, DynamicConfigService dynamicConfigService, Clock clock) {
        this.repo = repo;
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
    public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) {
        checkCache();

        return cache.computeIfAbsent(type.name(), k ->
                repo.findByServiceTypeAndEnabledOrderByPriorityAsc(k, true)
                        .stream()
                        .map(this::toDomain)
                        .collect(Collectors.toList())
        );
    }

    @Override
    public void refresh() {
        cache.clear();
        lastUpdate = LocalDateTime.now(clock);
        log.info("ServiceRoutingRuleGateway cache cleared.");
    }

    private ServiceRoutingRule toDomain(ServiceRoutingRuleEntity e) {
        return new ServiceRoutingRule(
                e.getId(),
                ServiceType.valueOf(e.getServiceType()),
                e.getProviderCode(),
                e.isEnabled(),
                e.getPriority(),
                e.getMatchJson(),
                e.getBehaviorJson()
        );
    }
}
