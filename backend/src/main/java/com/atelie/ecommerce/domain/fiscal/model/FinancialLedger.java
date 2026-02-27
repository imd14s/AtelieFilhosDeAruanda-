package com.atelie.ecommerce.domain.fiscal.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Representa a 'Verdade Financeira' de uma transação.
 * Esta classe é imutável para garantir a auditabilidade.
 */
@Getter
@Builder
public class FinancialLedger {
    private final UUID id;
    private final UUID orderId;

    // Valor Bruto (Total pago pelo cliente)
    private final BigDecimal grossAmount;

    // Deduções
    private final BigDecimal gatewayFee; // Taxas do Gateway (ex: Mercado Pago)
    private final BigDecimal shippingCost; // Custo real da etiqueta (ex: Melhor Envio)
    private final BigDecimal taxesAmount; // Impostos calculados (ex: Simples Nacional)

    // Lucro Líquido
    private final BigDecimal netAmount;

    private final Instant createdAt;

    /**
     * Construtor principal que garante a integridade dos cálculos.
     */
    public FinancialLedger(UUID id, UUID orderId, BigDecimal grossAmount,
            BigDecimal gatewayFee, BigDecimal shippingCost,
            BigDecimal taxesAmount, BigDecimal netAmount, Instant createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.grossAmount = grossAmount;
        this.gatewayFee = gatewayFee != null ? gatewayFee : BigDecimal.ZERO;
        this.shippingCost = shippingCost != null ? shippingCost : BigDecimal.ZERO;
        this.taxesAmount = taxesAmount != null ? taxesAmount : BigDecimal.ZERO;
        this.createdAt = createdAt != null ? createdAt : Instant.now();

        // Validação da verdade financeira
        BigDecimal calculatedNet = grossAmount
                .subtract(this.gatewayFee)
                .subtract(this.shippingCost)
                .subtract(this.taxesAmount);

        this.netAmount = calculatedNet;
    }

    /**
     * Retorna a margem de contribuição em percentual.
     */
    public BigDecimal getContributionMargin() {
        if (grossAmount.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return netAmount.divide(grossAmount, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }
}
