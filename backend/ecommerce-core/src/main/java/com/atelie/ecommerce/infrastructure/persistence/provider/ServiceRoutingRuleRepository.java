package com.atelie.ecommerce.infrastructure.persistence.provider;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRoutingRuleRepository extends JpaRepository<ServiceRoutingRuleEntity, UUID> {
    List<ServiceRoutingRuleEntity> findByServiceTypeAndEnabledOrderByPriorityAsc(String serviceType, boolean enabled);
}
