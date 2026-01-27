package com.atelie.ecommerce.infrastructure.persistence.product;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;
import com.atelie.ecommerce.domain.order.OrderSource;

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

    @Enumerated(EnumType.STRING)
    private OrderSource integrationType;

    private String externalId;
    private String platformName;
    private LocalDateTime lastSync;

    // Construtor específico que o ProductIntegrationService está pedindo
    public ProductIntegrationEntity(ProductEntity product, OrderSource integrationType, String externalId, String platformName) {
        this.product = product;
        this.integrationType = integrationType;
        this.externalId = externalId;
        this.platformName = platformName;
        this.lastSync = LocalDateTime.now();
    }
}
