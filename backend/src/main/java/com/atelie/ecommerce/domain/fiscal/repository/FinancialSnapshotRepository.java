package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.FinancialSnapshot;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface FinancialSnapshotRepository {
    void save(FinancialSnapshot snapshot);

    Optional<FinancialSnapshot> findById(UUID id);

    Optional<FinancialSnapshot> findByPeriod(int month, int year);

    List<FinancialSnapshot> findAll();
}
