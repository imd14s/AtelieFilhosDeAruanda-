package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;
import com.atelie.ecommerce.domain.order.OrderSource;

@Repository
public interface ProductIntegrationRepository extends JpaRepository<ProductIntegrationEntity, UUID> {
    Optional<ProductIntegrationEntity> findByExternalIdAndIntegrationType(String externalId, OrderSource integrationType);
    List<ProductIntegrationEntity> findByProductId(UUID productId); // Método que o StockSyncListener pediu
}
