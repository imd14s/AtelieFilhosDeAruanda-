package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CashFlowRepository {
    CashFlowEntry save(CashFlowEntry entry);

    Optional<CashFlowEntry> findByOrderId(UUID orderId);

    Optional<CashFlowEntry> findByExternalId(String externalId);

    List<CashFlowEntry> findAllPendingUntil(Instant date);

    List<CashFlowEntry> findAllAvailable();

    void deleteByOrderId(UUID orderId);
}
