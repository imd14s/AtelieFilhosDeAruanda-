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

    // Mudança Crítica: String em vez de Enum para permitir novos marketplaces via banco
    @Column(name = "integration_type", nullable = false)
    private String integrationType; 

    private String externalId;
    private String platformName;
    private LocalDateTime lastSync;

    public ProductIntegrationEntity(ProductEntity product, String integrationType, String externalId, String platformName) {
        this.product = product;
        this.integrationType = integrationType; // Aceita qualquer string agora
        this.externalId = externalId;
        this.platformName = platformName;
        this.lastSync = LocalDateTime.now();
    }
}
