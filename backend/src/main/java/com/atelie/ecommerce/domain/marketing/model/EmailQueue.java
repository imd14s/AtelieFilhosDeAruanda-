package com.atelie.ecommerce.domain.marketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_queue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;

    @Column(name = "type")
    private String type; // NEWSLETTER, ABANDONED_CART, VERIFICATION

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "campaign_id")
    private UUID campaignId;

    public enum EmailPriority {
        LOW, MEDIUM, HIGH
    }

    public enum EmailStatus {
        PENDING, SENT, FAILED, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        if (priority == null)
            priority = EmailPriority.LOW;
        if (status == null)
            status = EmailStatus.PENDING;
        if (retryCount == null)
            retryCount = 0;
        if (scheduledAt == null)
            scheduledAt = LocalDateTime.now();
    }
}
