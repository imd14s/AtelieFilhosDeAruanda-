package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.util.List;

@Component
public class JpaServiceRoutingRuleGateway extends BaseCachingGateway implements ServiceRoutingRuleGateway {
    private final ServiceRoutingRuleJpaRepository repository;

    public JpaServiceRoutingRuleGateway(ServiceRoutingRuleJpaRepository repository, DynamicConfigService configService, Clock clock) {
        super(configService, clock);
        this.repository = repository;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) {
        checkCache();
        return (List<ServiceRoutingRule>) genericCache.computeIfAbsent("RULES_" + type,
            k -> repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                    .stream().map(e -> new ServiceRoutingRule(e.getId(), e.getServiceType(), e.getEnabled(), e.getPriority(), e.getMatchJson(), e.getProviderCode(), e.getBehaviorJson()))
                    .toList());
    }
}
