package com.atelie.ecommerce.infrastructure.persistence.product;

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
    private String skuExternal; // Campo adicionado corretamente

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Construtor utilitário corrigido
    public ProductIntegrationEntity(ProductEntity product, String integrationType, String externalId, String skuExternal) {
        this.product = product;
        this.integrationType = integrationType;
        this.externalId = externalId;
        this.skuExternal = skuExternal;
        this.createdAt = LocalDateTime.now();
    }
}
