package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;
import com.atelie.ecommerce.domain.fiscal.repository.GeneratedReportRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.GeneratedReportEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaGeneratedReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaGeneratedReportAdapter implements GeneratedReportRepository {

    private final JpaGeneratedReportRepository repository;

    @Override
    public void save(GeneratedReport report) {
        repository.save(toEntity(report));
    }

    @Override
    public Optional<GeneratedReport> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<GeneratedReport> findByRequestedBy(UUID userId) {
        return repository.findByRequestedBy(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<GeneratedReport> findAllPending() {
        return repository.findByStatus(GeneratedReport.ReportStatus.PENDING).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private GeneratedReportEntity toEntity(GeneratedReport domain) {
        return GeneratedReportEntity.builder()
                .id(domain.getId())
                .reportType(domain.getReportType())
                .period(domain.getPeriod())
                .requestedAt(domain.getRequestedAt())
                .completedAt(domain.getCompletedAt())
                .status(domain.getStatus())
                .fileKey(domain.getFileKey())
                .downloadUrl(domain.getDownloadUrl())
                .requestedBy(domain.getRequestedBy())
                .build();
    }

    private GeneratedReport toDomain(GeneratedReportEntity entity) {
        return GeneratedReport.builder()
                .id(entity.getId())
                .reportType(entity.getReportType())
                .period(entity.getPeriod())
                .requestedAt(entity.getRequestedAt())
                .completedAt(entity.getCompletedAt())
                .status(entity.getStatus())
                .fileKey(entity.getFileKey())
                .downloadUrl(entity.getDownloadUrl())
                .requestedBy(entity.getRequestedBy())
                .build();
    }
}
