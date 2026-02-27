package com.atelie.ecommerce.infrastructure.persistence.loyalty.entity;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "wallets")
public class WalletEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(nullable = false)
    private Integer balance = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addPoints(Integer points) {
        if (this.balance == null)
            this.balance = 0;
        this.balance += points;
    }

    public void deductPoints(Integer points) {
        if (this.balance == null)
            this.balance = 0;
        if (this.balance < points) {
            throw new IllegalArgumentException("Insufficient points balance.");
        }
        this.balance -= points;
    }
}
