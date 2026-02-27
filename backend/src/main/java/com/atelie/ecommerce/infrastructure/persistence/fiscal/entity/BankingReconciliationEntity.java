package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import com.atelie.ecommerce.domain.fiscal.model.BankingReconciliation;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "banking_reconciliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankingReconciliationEntity {
    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "system_amount", precision = 12, scale = 2)
    private BigDecimal systemAmount;

    @Column(name = "gateway_amount", precision = 12, scale = 2)
    private BigDecimal gatewayAmount;

    @Column(name = "fee_difference", precision = 12, scale = 2)
    private BigDecimal feeDifference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BankingReconciliation.ReconciliationStatus status;

    @Column(name = "discrepancy_reason")
    private String discrepancyReason;

    @Column(name = "reconciled_at")
    private Instant reconciledAt;

    public BankingReconciliation toDomain() {
        return BankingReconciliation.builder()
                .id(id)
                .orderId(orderId)
                .externalId(externalId)
                .systemAmount(systemAmount)
                .gatewayAmount(gatewayAmount)
                .feeDifference(feeDifference)
                .status(status)
                .discrepancyReason(discrepancyReason)
                .reconciledAt(reconciledAt)
                .build();
    }

    public static BankingReconciliationEntity fromDomain(BankingReconciliation domain) {
        return BankingReconciliationEntity.builder()
                .id(domain.getId())
                .orderId(domain.getOrderId())
                .externalId(domain.getExternalId())
                .systemAmount(domain.getSystemAmount())
                .gatewayAmount(domain.getGatewayAmount())
                .feeDifference(domain.getFeeDifference())
                .status(domain.getStatus())
                .discrepancyReason(domain.getDiscrepancyReason())
                .reconciledAt(domain.getReconciledAt())
                .build();
    }
}
