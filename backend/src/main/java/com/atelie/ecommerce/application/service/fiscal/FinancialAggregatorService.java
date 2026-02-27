package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.domain.order.model.OrderModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Serviço responsável por agregar dados financeiros de diversas fontes
 * (Pedidos, Gateways, Fretes, Impostos) em um Ledger auditável.
 */
@Service
@Slf4j
public class FinancialAggregatorService {

    private final FinancialLedgerRepository ledgerRepository;
    private final OrderService orderService;
    private final FiscalExtractorService fiscalExtractor;
    private final com.atelie.ecommerce.domain.fiscal.repository.CashFlowRepository cashFlowRepository;
    private final com.atelie.ecommerce.domain.fiscal.repository.FinancialSnapshotRepository snapshotRepository;

    // TODO: Mover para um DynamicConfigService no futuro
    private static final BigDecimal GATEWAY_FEE_PERCENT = new BigDecimal("0.0399"); // 3.99%
    private static final BigDecimal TAX_PERCENT = new BigDecimal("0.0600"); // 6.00% (Simples Nacional)

    public FinancialAggregatorService(FinancialLedgerRepository ledgerRepository,
            @org.springframework.context.annotation.Lazy OrderService orderService,
            FiscalExtractorService fiscalExtractor,
            com.atelie.ecommerce.domain.fiscal.repository.CashFlowRepository cashFlowRepository,
            com.atelie.ecommerce.domain.fiscal.repository.FinancialSnapshotRepository snapshotRepository) {
        this.ledgerRepository = ledgerRepository;
        this.orderService = orderService;
        this.fiscalExtractor = fiscalExtractor;
        this.cashFlowRepository = cashFlowRepository;
        this.snapshotRepository = snapshotRepository;
    }

    /**
     * Consolida a verdade financeira de um pedido.
     */
    @Transactional
    public void aggregate(UUID orderId) {
        OrderEntity order = (OrderEntity) orderService.getOrderModelById(orderId);

        // 0. Validar se o período está congelado
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.systemDefault());
        snapshotRepository.findByPeriod(now.getMonthValue(), now.getYear()).ifPresent(snapshot -> {
            if (snapshot.isFrozen()) {
                throw new IllegalStateException("O período financeiro " + now.getMonthValue() + "/" + now.getYear()
                        + " está CONGELADO. Não é possível realizar novas agregações.");
            }
        });

        // 1. Extrair Impostos Reais do XML da NF-e
        FiscalExtractorService.TaxBreakdown taxes = fiscalExtractor.extractTaxes(order.getNfeProtocolXml());

        // 2. Calcular Custo de Mercadoria (CMV)
        BigDecimal totalProductCost = order.getItems().stream()
                .map(item -> {
                    BigDecimal unitCost = item.getVariant() != null ? item.getVariant().getCostPrice()
                            : BigDecimal.ZERO;
                    if (unitCost == null)
                        unitCost = BigDecimal.ZERO;
                    return unitCost.multiply(new BigDecimal(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Taxas de Gateway (Simulado - Idealmente viria de um Webhook do Gateway)
        BigDecimal gatewayFee = order.getTotalAmount().multiply(GATEWAY_FEE_PERCENT);

        // 4. Custo de Frete (Já registrado no pedido)
        BigDecimal shippingCost = order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO;

        // 5. Criar Razão Financeira Imutável
        FinancialLedger ledger = FinancialLedger.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .grossAmount(order.getTotalAmount())
                .gatewayFee(gatewayFee)
                .shippingCost(shippingCost)
                .taxesAmount(taxes.totalTaxes())
                .icmsAmount(taxes.icms())
                .pisAmount(taxes.pis())
                .cofinsAmount(taxes.cofins())
                .issAmount(taxes.iss())
                .productCost(totalProductCost)
                .createdAt(Instant.now())
                .build();

        ledgerRepository.save(ledger);

        // 6. Criar entrada de Fluxo de Caixa (Conciliação)
        Instant expectedReleaseDate = Instant.now().plus(30, java.time.temporal.ChronoUnit.DAYS);
        if ("pix".equalsIgnoreCase(order.getSource()) || "PIX".equalsIgnoreCase(order.getSource())) {
            expectedReleaseDate = Instant.now();
        }

        com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry cashFlow = com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry
                .builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .externalId(order.getExternalId())
                .grossAmount(order.getTotalAmount())
                .netAmount(order.getTotalAmount().subtract(gatewayFee))
                .totalFees(gatewayFee)
                .type("INFLOW")
                .status(com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry.CashFlowStatus.PENDING)
                .expectedReleaseDate(expectedReleaseDate)
                .gateway("MERCADO_PAGO") // Assumido gateway principal
                .createdAt(Instant.now())
                .build();

        cashFlowRepository.save(cashFlow);
    }

    /**
     * Consulta o Ledger consolidado de um pedido.
     */
    public FinancialLedger getByOrder(UUID orderId) {
        return ledgerRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Ledger financeiro não encontrado para o pedido: " + orderId));
    }
}
