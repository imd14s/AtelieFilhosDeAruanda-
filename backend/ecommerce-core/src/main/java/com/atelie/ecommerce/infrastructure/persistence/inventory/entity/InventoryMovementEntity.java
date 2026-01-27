package com.atelie.ecommerce.infrastructure.persistence.inventory.entity;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovementEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

    @Column(nullable = false)
    private Integer quantity;

    private String reason;
    
    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // Constructors
    public InventoryMovementEntity() {}

    public InventoryMovementEntity(ProductEntity product, MovementType type, Integer quantity, String reason, String referenceId) {
        this.product = product;
        this.type = type;
        this.quantity = quantity;
        this.reason = reason;
        this.referenceId = referenceId;
    }

    // Getters
    public UUID getId() { return id; }
    public ProductEntity getProduct() { return product; }
    public MovementType getType() { return type; }
    public Integer getQuantity() { return quantity; }
    public String getReason() { return reason; }
    public String getReferenceId() { return referenceId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
