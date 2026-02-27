package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface GeneratedReportRepository {
    void save(GeneratedReport report);

    Optional<GeneratedReport> findById(UUID id);

    List<GeneratedReport> findByRequestedBy(UUID userId);

    List<GeneratedReport> findAllPending();
}
