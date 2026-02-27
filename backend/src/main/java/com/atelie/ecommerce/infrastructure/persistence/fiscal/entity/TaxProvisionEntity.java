package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tax_provisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxProvisionEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Column(name = "total_revenue", precision = 12, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "total_taxes", precision = 12, scale = 2)
    private BigDecimal totalTaxes;

    @Column(name = "total_icms", precision = 12, scale = 2)
    private BigDecimal totalIcms;

    @Column(name = "total_pis", precision = 12, scale = 2)
    private BigDecimal totalPis;

    @Column(name = "total_cofins", precision = 12, scale = 2)
    private BigDecimal totalCofins;

    @Column(name = "estimated_net_profit", precision = 12, scale = 2)
    private BigDecimal estimatedNetProfit;

    private String status;

    public com.atelie.ecommerce.domain.fiscal.model.TaxProvision toDomain() {
        return com.atelie.ecommerce.domain.fiscal.model.TaxProvision.builder()
                .id(id)
                .month(month)
                .year(year)
                .totalRevenue(totalRevenue)
                .totalTaxes(totalTaxes)
                .totalIcms(totalIcms)
                .totalPis(totalPis)
                .totalCofins(totalCofins)
                .estimatedNetProfit(estimatedNetProfit)
                .status(status)
                .build();
    }

    public static TaxProvisionEntity fromDomain(com.atelie.ecommerce.domain.fiscal.model.TaxProvision domain) {
        TaxProvisionEntity entity = new TaxProvisionEntity();
        entity.id = domain.getId();
        entity.month = domain.getMonth();
        entity.year = domain.getYear();
        entity.totalRevenue = domain.getTotalRevenue();
        entity.totalTaxes = domain.getTotalTaxes();
        entity.totalIcms = domain.getTotalIcms();
        entity.totalPis = domain.getTotalPis();
        entity.totalCofins = domain.getTotalCofins();
        entity.estimatedNetProfit = domain.getEstimatedNetProfit();
        entity.status = domain.getStatus();
        return entity;
    }
}
