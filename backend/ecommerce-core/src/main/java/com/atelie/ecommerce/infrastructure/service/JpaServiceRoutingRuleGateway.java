package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class JpaServiceRoutingRuleGateway implements ServiceRoutingRuleGateway {

    private final ServiceRoutingRuleJpaRepository repo;

    public JpaServiceRoutingRuleGateway(ServiceRoutingRuleJpaRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) {
        return repo.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
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
