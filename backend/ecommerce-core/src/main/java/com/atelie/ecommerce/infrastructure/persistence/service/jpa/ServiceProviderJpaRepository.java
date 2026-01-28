package com.atelie.ecommerce.infrastructure.persistence.service.jpa;

import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceProviderJpaRepository extends JpaRepository<ServiceProviderEntity, UUID> {
    List<ServiceProviderEntity> findByServiceType(String serviceType);
    Optional<ServiceProviderEntity> findByCode(String code);
}
