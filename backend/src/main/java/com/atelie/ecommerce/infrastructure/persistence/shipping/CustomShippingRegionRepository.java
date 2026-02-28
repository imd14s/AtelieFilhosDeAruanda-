package com.atelie.ecommerce.infrastructure.persistence.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomShippingRegionRepository extends JpaRepository<CustomShippingRegionEntity, UUID> {

    boolean existsByProviderIdAndCep(UUID providerId, String cep);

    void deleteByProviderId(UUID providerId);

    long countByProviderId(UUID providerId);
}
