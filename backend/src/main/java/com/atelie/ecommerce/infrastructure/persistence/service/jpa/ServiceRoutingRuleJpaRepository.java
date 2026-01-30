package com.atelie.ecommerce.infrastructure.persistence.service.jpa;

import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRoutingRuleJpaRepository extends JpaRepository<ServiceRoutingRuleEntity, UUID> {
    List<ServiceRoutingRuleEntity> findByServiceTypeAndEnabledOrderByPriorityAsc(String serviceType, boolean enabled);
}
