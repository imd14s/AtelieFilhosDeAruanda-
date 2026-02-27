package com.atelie.ecommerce.infrastructure.persistence.loyalty.repository;

import com.atelie.ecommerce.infrastructure.persistence.loyalty.entity.WalletTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransactionEntity, UUID> {
    boolean existsByReferenceIdAndTypeAndReason(UUID referenceId, WalletTransactionEntity.TransactionType type,
            String reason);
}
