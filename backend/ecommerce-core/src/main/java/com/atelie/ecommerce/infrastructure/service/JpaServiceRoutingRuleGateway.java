package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JpaServiceRoutingRuleGateway implements ServiceRoutingRuleGateway {

    private final ServiceRoutingRuleJpaRepository repo;
    private final Map<String, List<ServiceRoutingRule>> cache = new ConcurrentHashMap<>();
    private LocalDateTime lastUpdate = LocalDateTime.MIN;

    public JpaServiceRoutingRuleGateway(ServiceRoutingRuleJpaRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) {
        if (LocalDateTime.now().isAfter(lastUpdate.plusMinutes(5))) {
            refresh();
        }

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
        lastUpdate = LocalDateTime.now();
        System.out.println("ServiceRoutingRuleGateway cache cleared.");
    }

    private ServiceRoutingRule toDomain(ServiceRoutingRuleEntity e) {
        return new ServiceRoutingRule(e.getId(), ServiceType.valueOf(e.getServiceType()), e.getProviderCode(), e.isEnabled(), e.getPriority(), e.getMatchJson(), e.getBehaviorJson());
    }
}
