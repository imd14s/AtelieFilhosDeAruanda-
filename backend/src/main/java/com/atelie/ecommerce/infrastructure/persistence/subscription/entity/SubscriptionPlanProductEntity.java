package com.atelie.ecommerce.infrastructure.persistence.subscription.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "subscription_plan_products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanProductEntity {

    @EmbeddedId
    private SubscriptionPlanProductId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("planId")
    @JoinColumn(name = "plan_id")
    private SubscriptionPlanEntity plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionPlanProductId implements java.io.Serializable {
        private UUID planId;
        private UUID productId;
    }
}
