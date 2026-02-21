package com.atelie.ecommerce.infrastructure.persistence.marketing.entity;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "product_view_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductViewHistoryEntity {

    @EmbeddedId
    private HistoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        viewedAt = LocalDateTime.now();
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryId implements Serializable {
        private UUID userId;
        private UUID productId;
    }
}
