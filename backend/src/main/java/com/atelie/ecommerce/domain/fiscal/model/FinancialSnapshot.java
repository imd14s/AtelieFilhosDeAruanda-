package com.atelie.ecommerce.domain.fiscal.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Representa o estado financeiro imutável de um período (mês/ano).
 * Utilizado para conformidade e auditoria.
 */
@Getter
@Builder
public class FinancialSnapshot {
    private final UUID id;
    private final int month;
    private final int year;

    private final BigDecimal totalGrossAmount;
    private final BigDecimal totalNetAmount;
    private final BigDecimal totalTaxesAmount;
    private final BigDecimal totalGatewayFees;
    private final BigDecimal totalShippingCosts;
    private final BigDecimal totalProductCosts;

    private final long totalOrders;

    private final boolean frozen; // Se true, os dados deste período não podem mais ser alterados
    private final Instant snapshotDate;

    private final String metadata; // JSON com informações adicionais de auditoria

    public FinancialSnapshot(UUID id, int month, int year, BigDecimal totalGrossAmount, BigDecimal totalNetAmount,
            BigDecimal totalTaxesAmount, BigDecimal totalGatewayFees, BigDecimal totalShippingCosts,
            BigDecimal totalProductCosts, long totalOrders, boolean frozen, Instant snapshotDate,
            String metadata) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.totalGrossAmount = totalGrossAmount != null ? totalGrossAmount : BigDecimal.ZERO;
        this.totalNetAmount = totalNetAmount != null ? totalNetAmount : BigDecimal.ZERO;
        this.totalTaxesAmount = totalTaxesAmount != null ? totalTaxesAmount : BigDecimal.ZERO;
        this.totalGatewayFees = totalGatewayFees != null ? totalGatewayFees : BigDecimal.ZERO;
        this.totalShippingCosts = totalShippingCosts != null ? totalShippingCosts : BigDecimal.ZERO;
        this.totalProductCosts = totalProductCosts != null ? totalProductCosts : BigDecimal.ZERO;
        this.totalOrders = totalOrders;
        this.frozen = frozen;
        this.snapshotDate = snapshotDate != null ? snapshotDate : Instant.now();
        this.metadata = metadata;
    }
}
