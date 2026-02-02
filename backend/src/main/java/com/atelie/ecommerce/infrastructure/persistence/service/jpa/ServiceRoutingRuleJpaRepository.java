package com.atelie.ecommerce.infrastructure.persistence.service.jpa;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRoutingRuleJpaRepository extends JpaRepository<ServiceRoutingRuleEntity, UUID> {
    
    // CORREÇÃO: Parâmetro atualizado de String para ServiceType para casar com a Entidade e Gateway
    List<ServiceRoutingRuleEntity> findByServiceTypeAndEnabledOrderByPriorityAsc(ServiceType serviceType, boolean enabled);
}
