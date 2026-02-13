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

    @Column(name = "integration_type", nullable = false)
    private String integrationType;

    @Column(name = "external_id")
    private String externalId;

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

    public String getIntegrationType() {
        return integrationType;
    }

    public void setIntegrationType(String integrationType) {
        this.integrationType = integrationType;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
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

    public ProductIntegrationEntity(ProductEntity product, String integrationType, String externalId,
            String skuExternal) {
        this.product = product;
        this.integrationType = integrationType;
        this.externalId = externalId;
        this.skuExternal = skuExternal;
        this.createdAt = LocalDateTime.now();
    }
}
