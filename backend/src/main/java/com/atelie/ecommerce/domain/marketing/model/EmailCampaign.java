package com.atelie.ecommerce.domain.marketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_campaigns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status;

    @Column(name = "total_recipients")
    private Integer totalRecipients;

    @Column(name = "sent_count")
    private Integer sentCount;

    @Column(name = "audience")
    private String audience; // ALL_CUSTOMERS, NEWSLETTER_SUBSCRIBERS, TEST

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CampaignStatus {
        PENDING, SENDING, PAUSED, COMPLETED, FAILED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null)
            status = CampaignStatus.PENDING;
        if (sentCount == null)
            sentCount = 0;
        if (totalRecipients == null)
            totalRecipients = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
