package com.atelie.ecommerce.infrastructure.persistence.provider;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceProviderRepository extends JpaRepository<ServiceProviderEntity, UUID> {
    List<ServiceProviderEntity> findByServiceTypeAndEnabledOrderByPriorityAsc(String serviceType, boolean enabled);
}
