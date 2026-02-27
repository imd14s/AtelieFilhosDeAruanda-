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
public class CashFlowEntry {
    private final UUID id;
    private final UUID orderId;
    private final String externalId;
    private final BigDecimal grossAmount;
    private final BigDecimal netAmount;
    private final BigDecimal totalFees;
    private final String type; // INFLOW, OUTFLOW
    private final CashFlowStatus status;
    private final Instant expectedReleaseDate;
    private final Instant actualReleaseDate;
    private final String gateway; // MERCADO_PAGO, PIX, etc.
    private final Instant createdAt;

    public enum CashFlowStatus {
        PENDING, // Sold but not released (Saldo Pendente)
        AVAILABLE, // Released for use (Saldo Disponível)
        SETTLED, // Already withdrawn or used
        CANCELED, // Order canceled/Chargeback
        DISCREPANCY // Value mismatch found during reconciliation
    }
}
