package com.atelie.ecommerce.infrastructure.persistence.product.entity;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEntity {
    @Id
    private UUID id;
    
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private BigDecimal price;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    
    // Suporte a lista de imagens
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;
    
    @Column(name = "active")
    private Boolean active;
    
    @Column(name = "alert_enabled")
    private Boolean alertEnabled;

    // --- CORREÇÃO: Relacionamento com Categoria Restaurado ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private CategoryEntity category;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // --- MÉTODOS DE COMPATIBILIDADE ---
    public String getImageUrl() {
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }

    public void setImageUrl(String url) {
        if (this.images == null) this.images = new ArrayList<>();
        if (url != null && !this.images.contains(url)) {
            this.images.add(0, url);
        }
    }

    // Método auxiliar exigido pelo ProductManagementController
    public UUID getCategoryId() {
        return category != null ? category.getId() : null;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (active == null) active = true;
        if (alertEnabled == null) alertEnabled = false;
        if (images == null) images = new ArrayList<>();
        if (stockQuantity == null) stockQuantity = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
