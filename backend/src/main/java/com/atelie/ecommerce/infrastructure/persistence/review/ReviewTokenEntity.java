package com.atelie.ecommerce.infrastructure.persistence.review;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "review_tokens")
@Data
public class ReviewTokenEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (token == null)
            token = UUID.randomUUID().toString();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
