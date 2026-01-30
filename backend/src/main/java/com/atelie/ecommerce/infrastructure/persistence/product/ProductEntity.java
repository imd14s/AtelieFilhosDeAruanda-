package com.atelie.ecommerce.infrastructure.persistence.product;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default // CORREÇÃO: Garante que o Builder use o valor 0 se não for informado
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Builder.Default // CORREÇÃO: Garante que o Builder use false se não for informado
    @Column(name = "alert_enabled")
    private Boolean alertEnabled = false;

    @Column(columnDefinition = "jsonb")
    private String attributes; // JSON attributes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private CategoryEntity category;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (stockQuantity == null) stockQuantity = 0;
        if (active == null) active = true;
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper para o Controller
    public UUID getCategoryId() {
        return category != null ? category.getId() : null;
    }
}
