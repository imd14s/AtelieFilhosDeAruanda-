package com.atelie.ecommerce.infrastructure.persistence.shipping;

import com.atelie.ecommerce.domain.shipping.model.ShippingProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingProviderRepository extends JpaRepository<ShippingProvider, UUID> {
    Optional<ShippingProvider> findByName(String name);
}
