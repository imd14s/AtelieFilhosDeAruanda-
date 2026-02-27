package com.atelie.ecommerce.infrastructure.persistence.loyalty.repository;

import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<WalletEntity, UUID> {
    Optional<WalletEntity> findByUserId(UUID userId);
}
