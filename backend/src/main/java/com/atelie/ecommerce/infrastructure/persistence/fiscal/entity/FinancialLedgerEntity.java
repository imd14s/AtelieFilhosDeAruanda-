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

    @Column(name = "gross_amount", nullable = false)
    private BigDecimal grossAmount;

    @Column(name = "gateway_fee", nullable = false)
    private BigDecimal gatewayFee;

    @Column(name = "shipping_cost", nullable = false)
    private BigDecimal shippingCost;

    @Column(name = "taxes_amount", nullable = false)
    private BigDecimal taxesAmount;

    @Column(name = "net_amount", nullable = false)
    private BigDecimal netAmount;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
