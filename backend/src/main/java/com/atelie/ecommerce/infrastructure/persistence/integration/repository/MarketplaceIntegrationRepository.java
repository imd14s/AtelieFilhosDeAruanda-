package com.atelie.ecommerce.infrastructure.persistence.integration.repository;

import com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketplaceIntegrationRepository extends JpaRepository<MarketplaceIntegrationEntity, UUID> {
    Optional<MarketplaceIntegrationEntity> findByProvider(String provider);

    List<MarketplaceIntegrationEntity> findByProviderAndActiveTrue(String provider);
}
