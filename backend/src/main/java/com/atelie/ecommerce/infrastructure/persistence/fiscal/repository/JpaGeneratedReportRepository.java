package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.GeneratedReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JpaGeneratedReportRepository extends JpaRepository<GeneratedReportEntity, UUID> {
    List<GeneratedReportEntity> findByRequestedBy(UUID requestedBy);

    List<GeneratedReportEntity> findByStatus(GeneratedReport.ReportStatus status);
}
