package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "financial_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialSnapshotEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalGrossAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalNetAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalTaxesAmount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalGatewayFees;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalShippingCosts;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalProductCosts;

    @Column(nullable = false)
    private long totalOrders;

    @Column(nullable = false)
    private boolean frozen;

    @Column(nullable = false)
    private Instant snapshotDate;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
