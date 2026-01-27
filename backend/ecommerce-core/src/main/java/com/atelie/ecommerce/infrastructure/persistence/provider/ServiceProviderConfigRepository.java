package com.atelie.ecommerce.infrastructure.persistence.provider;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ServiceProviderConfigRepository extends JpaRepository<ServiceProviderConfigEntity, UUID> {
    Optional<ServiceProviderConfigEntity> findByProviderIdAndEnvironment(UUID providerId, String environment);
}
