package com.atelie.ecommerce.infrastructure.persistence.shipping;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipping_labels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingLabelEntity {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true)
    private OrderEntity order;

    @Column(name = "external_id", length = 100)
    private String externalId; // ID no Melhor Envio / Correios

    @Column(name = "tracking_code", length = 100)
    private String trackingCode;

    @Column(name = "label_url", columnDefinition = "TEXT")
    private String labelUrl;

    @Column(name = "status", length = 50)
    private String status; // PENDING, GENERATED, CANCELED

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;
}
