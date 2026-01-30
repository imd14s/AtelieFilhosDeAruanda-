package com.atelie.ecommerce.infrastructure.persistence.feature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlagEntity, UUID> {
    Optional<FeatureFlagEntity> findByFlagKey(String flagKey);
}
