package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import java.util.Optional;
import java.util.UUID;

/**
 * Porto de persistência para o Razão Financeiro.
 */
public interface FinancialLedgerRepository {
    FinancialLedger save(FinancialLedger ledger);

    Optional<FinancialLedger> findByOrderId(UUID orderId);

    java.util.List<FinancialLedger> findAllInPeriod(java.time.Instant start, java.time.Instant end);

    void deleteByOrderId(UUID orderId);
}
