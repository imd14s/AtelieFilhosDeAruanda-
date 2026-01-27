package com.atelie.ecommerce.infrastructure.persistence.catalog.product;

import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductIntegrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductIntegrationRepository extends JpaRepository<ProductIntegrationEntity, UUID> {
    Optional<ProductIntegrationEntity> findByExternalIdAndIntegrationType(String externalId, OrderSource integrationType);
    java.util.List<ProductIntegrationEntity> findByProductId(UUID productId);
}
