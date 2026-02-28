package com.atelie.ecommerce.infrastructure.persistence.shipping;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "custom_shipping_regions", indexes = {
        @Index(name = "idx_provider_cep", columnList = "provider_id, cep")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomShippingRegionEntity {

    @Id
    private UUID id;

    @Column(name = "provider_id", nullable = false)
    private UUID providerId;

    @Column(nullable = false, length = 8)
    private String cep;
}
