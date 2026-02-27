package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cash_flow_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashFlowEntryEntity {
    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "gross_amount", precision = 12, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "net_amount", precision = 12, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "total_fees", precision = 12, scale = 2)
    private BigDecimal totalFees;

    @Column(nullable = false)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashFlowEntry.CashFlowStatus status;

    @Column(name = "expected_release_date")
    private Instant expectedReleaseDate;

    @Column(name = "actual_release_date")
    private Instant actualReleaseDate;

    private String gateway;

    @Column(name = "created_at")
    private Instant createdAt;

    public CashFlowEntry toDomain() {
        return CashFlowEntry.builder()
                .id(id)
                .orderId(orderId)
                .externalId(externalId)
                .grossAmount(grossAmount)
                .netAmount(netAmount)
                .totalFees(totalFees)
                .type(type)
                .status(status)
                .expectedReleaseDate(expectedReleaseDate)
                .actualReleaseDate(actualReleaseDate)
                .gateway(gateway)
                .createdAt(createdAt)
                .build();
    }

    public static CashFlowEntryEntity fromDomain(CashFlowEntry domain) {
        return CashFlowEntryEntity.builder()
                .id(domain.getId())
                .orderId(domain.getOrderId())
                .externalId(domain.getExternalId())
                .grossAmount(domain.getGrossAmount())
                .netAmount(domain.getNetAmount())
                .totalFees(domain.getTotalFees())
                .type(domain.getType())
                .status(domain.getStatus())
                .expectedReleaseDate(domain.getExpectedReleaseDate())
                .actualReleaseDate(domain.getActualReleaseDate())
                .gateway(domain.getGateway())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
