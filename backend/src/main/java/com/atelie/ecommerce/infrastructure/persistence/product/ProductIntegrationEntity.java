package com.atelie.ecommerce.infrastructure.persistence.product;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_integrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductIntegrationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "integration_id", nullable = false)
    private com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity integration;

    @Column(name = "external_product_id")
    private String externalProductId;

    @Column(name = "sku_external")
    private String skuExternal;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity getIntegration() {
        return integration;
    }

    public void setIntegration(
            com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity integration) {
        this.integration = integration;
    }

    public String getExternalProductId() {
        return externalProductId;
    }

    public void setExternalProductId(String externalProductId) {
        this.externalProductId = externalProductId;
    }

    public String getSkuExternal() {
        return skuExternal;
    }

    public void setSkuExternal(String skuExternal) {
        this.skuExternal = skuExternal;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ProductIntegrationEntity(ProductEntity product,
            com.atelie.ecommerce.infrastructure.persistence.integration.entity.MarketplaceIntegrationEntity integration,
            String externalProductId,
            String skuExternal) {
        this.product = product;
        this.integration = integration;
        this.externalProductId = externalProductId;
        this.skuExternal = skuExternal;
        this.createdAt = LocalDateTime.now();
    }
}
