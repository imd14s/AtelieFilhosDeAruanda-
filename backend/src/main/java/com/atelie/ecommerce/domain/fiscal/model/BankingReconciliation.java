package com.atelie.ecommerce.domain.fiscal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class BankingReconciliation {
    private final UUID id;
    private final UUID orderId;
    private final String externalId;
    private final BigDecimal systemAmount;
    private final BigDecimal gatewayAmount;
    private final BigDecimal feeDifference;
    private final ReconciliationStatus status;
    private final String discrepancyReason;
    private final Instant reconciledAt;

    public enum ReconciliationStatus {
        MATCHED,
        DISCREPANCY,
        CHARGEBACK,
        PENDING
    }
}
