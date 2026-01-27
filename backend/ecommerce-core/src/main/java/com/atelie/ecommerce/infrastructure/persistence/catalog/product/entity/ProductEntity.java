package com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity;

import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products")
public class ProductEntity {
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false) private String name;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private BigDecimal price;
    @Column(nullable = false) private Boolean active;
    
    @Column(name = "image_url")
    private String imageUrl; // Novo campo

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @PrePersist
    protected void onCreate() { if (id == null) id = UUID.randomUUID(); }

    public ProductEntity() {}
    
    public ProductEntity(String name, String description, BigDecimal price, Integer stock, CategoryEntity category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.active = true;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public CategoryEntity getCategory() { return category; }
    public void setCategory(CategoryEntity category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
