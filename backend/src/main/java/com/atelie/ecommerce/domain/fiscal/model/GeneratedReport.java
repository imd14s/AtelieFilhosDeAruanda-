package com.atelie.ecommerce.domain.fiscal.model;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * Rastreia a geração de um relatório assíncrono.
 */
@Getter
@Builder
public class GeneratedReport {
    private final UUID id;
    private final String reportType; // CSV, PDF
    private final String period; // Today, 7d, 30d, custom
    private final Instant requestedAt;
    private final Instant completedAt;
    private final ReportStatus status;
    private final String fileKey; // Chave para o armazenamento (S3/Cloudinary/Local)
    private final String downloadUrl; // URL temporária
    private final UUID requestedBy;

    public enum ReportStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    public GeneratedReport(UUID id, String reportType, String period, Instant requestedAt,
            Instant completedAt, ReportStatus status, String fileKey,
            String downloadUrl, UUID requestedBy) {
        this.id = id;
        this.reportType = reportType;
        this.period = period;
        this.requestedAt = requestedAt != null ? requestedAt : Instant.now();
        this.completedAt = completedAt;
        this.status = status != null ? status : ReportStatus.PENDING;
        this.fileKey = fileKey;
        this.downloadUrl = downloadUrl;
        this.requestedBy = requestedBy;
    }
}
