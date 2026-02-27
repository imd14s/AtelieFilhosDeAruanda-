package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "financial_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FinancialLedgerEntity {

    @Id
    private UUID id;

    @Column(name = "order_id", unique = true, nullable = false)
    private UUID orderId;

    @Column(name = "gross_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal grossAmount;

    @Column(name = "gateway_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal gatewayFee;

    @Column(name = "shipping_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal shippingCost;

    @Column(name = "taxes_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal taxesAmount;

    @Column(name = "icms_amount", precision = 12, scale = 2)
    private BigDecimal icmsAmount;

    @Column(name = "pis_amount", precision = 12, scale = 2)
    private BigDecimal pisAmount;

    @Column(name = "cofins_amount", precision = 12, scale = 2)
    private BigDecimal cofinsAmount;

    @Column(name = "iss_amount", precision = 12, scale = 2)
    private BigDecimal issAmount;

    @Column(name = "product_cost", precision = 12, scale = 2)
    private BigDecimal productCost;

    @Column(name = "net_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal netAmount;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public com.atelie.ecommerce.domain.fiscal.model.FinancialLedger toDomain() {
        return com.atelie.ecommerce.domain.fiscal.model.FinancialLedger.builder()
                .id(id)
                .orderId(orderId)
                .grossAmount(grossAmount)
                .gatewayFee(gatewayFee)
                .shippingCost(shippingCost)
                .taxesAmount(taxesAmount)
                .icmsAmount(icmsAmount)
                .pisAmount(pisAmount)
                .cofinsAmount(cofinsAmount)
                .issAmount(issAmount)
                .productCost(productCost)
                .netAmount(netAmount)
                .createdAt(createdAt)
                .build();
    }

    public static FinancialLedgerEntity fromDomain(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger domain) {
        FinancialLedgerEntity entity = new FinancialLedgerEntity();
        entity.id = domain.getId();
        entity.orderId = domain.getOrderId();
        entity.grossAmount = domain.getGrossAmount();
        entity.gatewayFee = domain.getGatewayFee();
        entity.shippingCost = domain.getShippingCost();
        entity.taxesAmount = domain.getTaxesAmount();
        entity.icmsAmount = domain.getIcmsAmount();
        entity.pisAmount = domain.getPisAmount();
        entity.cofinsAmount = domain.getCofinsAmount();
        entity.issAmount = domain.getIssAmount();
        entity.productCost = domain.getProductCost();
        entity.netAmount = domain.getNetAmount();
        entity.createdAt = domain.getCreatedAt();
        return entity;
    }
}
