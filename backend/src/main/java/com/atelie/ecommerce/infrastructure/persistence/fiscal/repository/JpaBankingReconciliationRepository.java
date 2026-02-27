package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.BankingReconciliationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface JpaBankingReconciliationRepository extends JpaRepository<BankingReconciliationEntity, UUID> {
    Optional<BankingReconciliationEntity> findByOrderId(UUID orderId);
}
