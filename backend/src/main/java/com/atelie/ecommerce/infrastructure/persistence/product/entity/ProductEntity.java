package com.atelie.ecommerce.infrastructure.persistence.product.entity;

import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
public class ProductEntity {
    public ProductEntity() {
        this.images = new ArrayList<>();
        this.marketplaces = new java.util.HashSet<>();
    }

    public ProductEntity(UUID id, String name, String description, BigDecimal price, Integer stockQuantity,
            CategoryEntity category, Boolean active) {
        this();
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.category = category;
        this.active = active;
    }

    @Id
    private UUID id;

    @JsonProperty("title")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;

    @JsonProperty("stock")
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Transient
    @JsonProperty("category")
    private UUID categoryId;

    // Suporte a lista de imagens
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> variants;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "product_marketplaces", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "provider_id"))
    private java.util.Set<com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity> marketplaces;

    // Campo transiente para facilitar updates via JSON sem DTO específico
    @Transient
    @JsonProperty("marketplaceIds")
    private List<UUID> marketplaceIds;

    public List<UUID> getMarketplaceIds() {
        return marketplaceIds;
    }

    public void setMarketplaceIds(List<UUID> marketplaceIds) {
        this.marketplaceIds = marketplaceIds;
    }

    // Helper para preencher marketplaceIds ao ler do banco (opcional, para
    // serialização)
    @PostLoad
    public void fillMarketplaceIds() {
        if (marketplaces != null) {
            this.marketplaceIds = marketplaces.stream()
                    .map(com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity::getId)
                    .collect(java.util.stream.Collectors.toList());
        }
    }

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
    @JsonProperty("category")
    public UUID getCategoryId() {
        return categoryId != null ? categoryId : (category != null ? category.getId() : null);
    }

    @JsonProperty("category")
    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
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

    // Explicit getters/setters for build compatibility
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    @JsonProperty("title")
    public String getName() {
        return name;
    }

    @JsonProperty("title")
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @JsonProperty("stock")
    public Integer getStockQuantity() {
        return stockQuantity;
    }

    @JsonProperty("stock")
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    // image_url uses explicit methods getImageUrl/setImageUrl already for single
    // string compatibility
    // but we should expose the list too
    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> getVariants() {
        return variants;
    }

    public void setVariants(
            List<com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity> variants) {
        this.variants = variants;
    }

    public java.util.Set<com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity> getMarketplaces() {
        return marketplaces;
    }

    public void setMarketplaces(
            java.util.Set<com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity> marketplaces) {
        this.marketplaces = marketplaces;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getAlertEnabled() {
        return alertEnabled;
    }

    public void setAlertEnabled(Boolean alertEnabled) {
        this.alertEnabled = alertEnabled;
    }

    public CategoryEntity getCategory() {
        return category;
    }

    public void setCategory(CategoryEntity category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
