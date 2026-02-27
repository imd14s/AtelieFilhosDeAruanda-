package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import com.atelie.ecommerce.domain.fiscal.model.GeneratedReport;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "generated_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedReportEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String reportType;

    @Column(nullable = false)
    private String period;

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GeneratedReport.ReportStatus status;

    private String fileKey;

    @Column(columnDefinition = "TEXT")
    private String downloadUrl;

    @Column(nullable = false)
    private UUID requestedBy;
}
