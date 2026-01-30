package com.atelie.ecommerce.infrastructure.persistence.service.jpa;

import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ServiceProviderConfigJpaRepository extends JpaRepository<ServiceProviderConfigEntity, UUID> {
    Optional<ServiceProviderConfigEntity> findTopByProviderIdAndEnvironmentOrderByVersionDesc(UUID providerId, String environment);
}
