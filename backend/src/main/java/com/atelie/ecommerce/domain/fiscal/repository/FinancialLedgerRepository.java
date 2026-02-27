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

    void deleteByOrderId(UUID orderId);
}
