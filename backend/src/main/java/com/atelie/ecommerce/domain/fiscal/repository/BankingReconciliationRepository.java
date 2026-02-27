package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.BankingReconciliation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BankingReconciliationRepository {
    BankingReconciliation save(BankingReconciliation reconciliation);

    Optional<BankingReconciliation> findByOrderId(UUID orderId);

    List<BankingReconciliation> findAll();
}
