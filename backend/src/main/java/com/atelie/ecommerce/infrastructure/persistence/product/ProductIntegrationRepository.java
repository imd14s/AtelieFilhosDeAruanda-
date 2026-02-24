package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProductIntegrationRepository extends JpaRepository<ProductIntegrationEntity, UUID> {
    // Busca flexível via JOIN
    Optional<ProductIntegrationEntity> findByExternalProductIdAndIntegration_Id(String externalProductId,
            UUID integrationId);

    Optional<ProductIntegrationEntity> findByProduct_IdAndIntegration_Id(UUID productId, UUID integrationId);

    List<ProductIntegrationEntity> findByProductId(UUID productId);
}
