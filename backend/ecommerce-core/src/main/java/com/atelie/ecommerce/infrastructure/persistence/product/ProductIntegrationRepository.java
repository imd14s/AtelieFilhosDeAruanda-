package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProductIntegrationRepository extends JpaRepository<ProductIntegrationEntity, UUID> {
    // Busca flexível por String
    Optional<ProductIntegrationEntity> findByExternalIdAndIntegrationType(String externalId, String integrationType);
    List<ProductIntegrationEntity> findByProductId(UUID productId);
}
