package com.atelie.ecommerce.infrastructure.persistence.provider;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlagEntity, UUID> {
    Optional<FeatureFlagEntity> findByFlagKey(String flagKey);
}
