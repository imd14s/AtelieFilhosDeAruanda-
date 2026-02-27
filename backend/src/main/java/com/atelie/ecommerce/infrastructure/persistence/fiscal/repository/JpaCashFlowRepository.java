package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.CashFlowEntryEntity;
import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaCashFlowRepository extends JpaRepository<CashFlowEntryEntity, UUID> {
    Optional<CashFlowEntryEntity> findByOrderId(UUID orderId);

    Optional<CashFlowEntryEntity> findByExternalId(String externalId);

    List<CashFlowEntryEntity> findByStatusAndExpectedReleaseDateBefore(CashFlowEntry.CashFlowStatus status,
            Instant date);

    List<CashFlowEntryEntity> findByStatus(CashFlowEntry.CashFlowStatus status);
}
