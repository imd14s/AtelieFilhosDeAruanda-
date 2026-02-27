package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FinancialLedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaFinancialLedgerRepository extends JpaRepository<FinancialLedgerEntity, UUID> {
    Optional<FinancialLedgerEntity> findByOrderId(UUID orderId);

    void deleteByOrderId(UUID orderId);
}
