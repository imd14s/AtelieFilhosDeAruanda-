package com.atelie.ecommerce.infrastructure.persistence.subscription.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "subscription_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionItemEntity {

    @Id
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private SubscriptionEntity subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
    }
}
