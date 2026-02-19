package com.atelie.ecommerce.infrastructure.persistence.service.jpa;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceProviderJpaRepository extends JpaRepository<ServiceProviderEntity, UUID> {

    List<ServiceProviderEntity> findByServiceTypeAndEnabledOrderByPriorityAsc(ServiceType serviceType, boolean enabled);

    List<ServiceProviderEntity> findByEnabledOrderByPriorityAsc(boolean enabled);

    // RESTAURADO: Necessário para o JpaServiceProviderConfigGateway
    Optional<ServiceProviderEntity> findByCode(String code);
}
