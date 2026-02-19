package com.atelie.ecommerce.infrastructure.persistence.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditResource resource;

    @Column(name = "resource_id")
    private String resourceId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "performed_by_user_id")
    private String performedByUserId;

    @Column(name = "performed_by_user_name")
    private String performedByUserName;

    @Column(name = "performed_by_user_email")
    private String performedByUserEmail;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "tenant_id")
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
