package com.atelie.ecommerce.infrastructure.persistence.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String type; // FIXED, CUSTOM

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price")
    private BigDecimal basePrice;

    @Column(name = "min_products")
    private Integer minProducts = 1;

    @Column(name = "max_products")
    private Integer maxProducts = 10;

    @Column(name = "is_coupon_pack")
    private Boolean isCouponPack = false;

    @Column(name = "coupon_bundle_count")
    private Integer couponBundleCount = 0;

    @Column(name = "coupon_discount_percentage")
    private BigDecimal couponDiscountPercentage = BigDecimal.ZERO;

    @Column(name = "coupon_validity_days")
    private Integer couponValidityDays = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubscriptionFrequencyRuleEntity> frequencyRules = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubscriptionPlanProductEntity> products = new ArrayList<>();

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
        if (active == null)
            active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
