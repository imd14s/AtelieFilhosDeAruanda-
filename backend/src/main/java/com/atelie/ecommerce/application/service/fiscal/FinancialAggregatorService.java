package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

/**
 * Serviço responsável por agregar dados financeiros de diversas fontes
 * (Pedidos, Gateways, Fretes, Impostos) em um Ledger auditável.
 */
@Service
@Slf4j
public class FinancialAggregatorService {

    private final FinancialLedgerRepository ledgerRepository;
    private final OrderRepository orderRepository;

    // TODO: Mover para um DynamicConfigService no futuro
    private static final BigDecimal GATEWAY_FEE_PERCENT = new BigDecimal("0.0399"); // 3.99%
    private static final BigDecimal TAX_PERCENT = new BigDecimal("0.0600"); // 6.00% (Simples Nacional)

    public FinancialAggregatorService(FinancialLedgerRepository ledgerRepository, OrderRepository orderRepository) {
        this.ledgerRepository = ledgerRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Consolida a verdade financeira de um pedido.
     */
    @Transactional
    public FinancialLedger aggregate(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(
                        () -> new NotFoundException("Pedido não encontrado para agregação financeira: " + orderId));

        BigDecimal grossAmount = order.getTotalAmount();

        // Custo do frete já registrado no pedido
        BigDecimal shippingCost = order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO;

        // Cálculo de Taxa do Gateway (Simulado)
        BigDecimal gatewayFee = grossAmount.multiply(GATEWAY_FEE_PERCENT).setScale(2, RoundingMode.HALF_UP);

        // Cálculo de Impostos (Simulado - Simples Nacional sobre o Faturamento Bruto)
        BigDecimal taxesAmount = grossAmount.multiply(TAX_PERCENT).setScale(2, RoundingMode.HALF_UP);

        FinancialLedger ledger = FinancialLedger.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .grossAmount(grossAmount)
                .gatewayFee(gatewayFee)
                .shippingCost(shippingCost)
                .taxesAmount(taxesAmount)
                .createdAt(Instant.now())
                .build();

        ledgerRepository.save(ledger);

        log.info("[FINANCEIRO] Ledger consolidado para o pedido {}. Líquido: R$ {}",
                orderId, ledger.getNetAmount());

        return ledger;
    }

    /**
     * Consulta o Ledger consolidado de um pedido.
     */
    public FinancialLedger getByOrder(UUID orderId) {
        return ledgerRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Ledger financeiro não encontrado para o pedido: " + orderId));
    }
}
