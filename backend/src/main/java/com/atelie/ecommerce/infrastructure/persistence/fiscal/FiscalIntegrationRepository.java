package com.atelie.ecommerce.infrastructure.persistence.fiscal;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FiscalIntegrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface FiscalIntegrationRepository extends JpaRepository<FiscalIntegrationEntity, UUID> {
    Optional<FiscalIntegrationEntity> findByActiveTrue();

    Optional<FiscalIntegrationEntity> findByProviderName(String providerName);
}
