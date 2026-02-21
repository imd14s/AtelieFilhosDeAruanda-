package com.atelie.ecommerce.infrastructure.persistence.subscription.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "subscription_frequency_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionFrequencyRuleEntity {

    @Id
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlanEntity plan;

    @Column(nullable = false)
    private String frequency; // WEEKLY, BIWEEKLY, MONTHLY

    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
    }
}
