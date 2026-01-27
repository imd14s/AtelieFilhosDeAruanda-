package com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity;

import com.atelie.ecommerce.domain.order.OrderSource;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_integrations")
public class ProductIntegrationEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Enumerated(EnumType.STRING)
    @Column(name = "integration_type", nullable = false)
    private OrderSource integrationType;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "sku_external")
    private String skuExternal;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public ProductIntegrationEntity() {}

    public ProductIntegrationEntity(ProductEntity product, OrderSource integrationType, String externalId, String skuExternal) {
        this.product = product;
        this.integrationType = integrationType;
        this.externalId = externalId;
        this.skuExternal = skuExternal;
    }

    // Getters
    public UUID getId() { return id; }
    public ProductEntity getProduct() { return product; }
    public OrderSource getIntegrationType() { return integrationType; } // Adicionado
    public String getExternalId() { return externalId; }
    public String getSkuExternal() { return skuExternal; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
