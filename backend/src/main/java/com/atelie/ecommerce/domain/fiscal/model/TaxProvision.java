package com.atelie.ecommerce.domain.fiscal.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class TaxProvision {
    private final UUID id;
    private final int month;
    private final int year;
    private final BigDecimal totalRevenue;
    private final BigDecimal totalTaxes;
    private final BigDecimal totalIcms;
    private final BigDecimal totalPis;
    private final BigDecimal totalCofins;
    private final BigDecimal estimatedNetProfit;
    private final String status; // PROVISIONED, PAID

    public TaxProvision(UUID id, int month, int year, BigDecimal totalRevenue,
            BigDecimal totalTaxes, BigDecimal totalIcms, BigDecimal totalPis,
            BigDecimal totalCofins, BigDecimal estimatedNetProfit, String status) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.totalRevenue = totalRevenue;
        this.totalTaxes = totalTaxes;
        this.totalIcms = totalIcms;
        this.totalPis = totalPis;
        this.totalCofins = totalCofins;
        this.estimatedNetProfit = estimatedNetProfit;
        this.status = status != null ? status : "PROVISIONED";
    }
}
