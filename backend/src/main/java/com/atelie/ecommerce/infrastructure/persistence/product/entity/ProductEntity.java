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
        if (this.images == null)
            this.images = new ArrayList<>();
        if (url != null && !this.images.contains(url)) {
            this.images.add(0, url);
        }
    }

    // Método auxiliar exigido pelo ProductManagementController
    public UUID getCategoryId() {
        return category != null ? category.getId() : null;
    }

    @Column(unique = true)
    private String slug;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
        if (active == null)
            active = true;
        if (alertEnabled == null)
            alertEnabled = false;
        if (images == null)
            images = new ArrayList<>();
        if (stockQuantity == null)
            stockQuantity = 0;

        generateSlug();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        generateSlug();
    }

    // Heuristic slug generation if null
    private void generateSlug() {
        if (this.slug == null || this.slug.isEmpty()) {
            if (this.name != null) {
                String safeName = this.name.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
                // Fallback to avoid empty slugs or collision risk (though simple)
                if (safeName.isEmpty())
                    safeName = "product";
                // Append first 4 chars of ID to ensure uniqueness or just use UUID if name is
                // empty
                String suffix = (this.id != null) ? this.id.toString().substring(0, 4)
                        : UUID.randomUUID().toString().substring(0, 4);
                this.slug = safeName + "-" + suffix;
            }
        }
    }
}
