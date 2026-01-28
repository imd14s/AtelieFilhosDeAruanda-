package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaServiceRoutingRuleGateway implements ServiceRoutingRuleGateway {

    private final ServiceRoutingRuleJpaRepository repo;

    public JpaServiceRoutingRuleGateway(ServiceRoutingRuleJpaRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<String> findRulesJson(ServiceType serviceType) {
        return repo.findByServiceType(serviceType.name()).stream()
                .filter(r -> r.isEnabled())
                .sorted((a, b) -> Integer.compare(a.getPriority(), b.getPriority()))
                .map(r -> r.getMatchJson()) // por enquanto devolve match_json, evoluímos depois
                .toList();
    }
}
