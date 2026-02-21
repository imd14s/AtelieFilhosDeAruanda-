package com.atelie.ecommerce.infrastructure.persistence.subscription.entity;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.customer.entity.UserAddressEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlanEntity plan;

    @Column(nullable = false)
    private String frequency; // WEEKLY, BIWEEKLY, MONTHLY

    @Column(nullable = false)
    private String status; // ACTIVE, PAUSED, CANCELED

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "next_billing_at", nullable = false)
    private LocalDateTime nextBillingAt;

    @Column(name = "last_billing_at")
    private LocalDateTime lastBillingAt;

    @Column(name = "card_token")
    private String cardToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id")
    private UserAddressEntity shippingAddress;

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubscriptionItemEntity> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null)
            status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
