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

    // TODO: Mover para um DynamicConfigService no futuro
    private static final BigDecimal GATEWAY_FEE_PERCENT = new BigDecimal("0.0399"); // 3.99%
    private static final BigDecimal TAX_PERCENT = new BigDecimal("0.0600"); // 6.00% (Simples Nacional)

    public FinancialAggregatorService(FinancialLedgerRepository ledgerRepository,
            @org.springframework.context.annotation.Lazy OrderService orderService,
            FiscalExtractorService fiscalExtractor) {
        this.ledgerRepository = ledgerRepository;
        this.orderService = orderService;
        this.fiscalExtractor = fiscalExtractor;
    }

    /**
     * Consolida a verdade financeira de um pedido.
     */
    @Transactional
    public void aggregate(UUID orderId) {
        OrderEntity order = (OrderEntity) orderService.getOrderModelById(orderId);

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
    }

    /**
     * Consulta o Ledger consolidado de um pedido.
     */
    public FinancialLedger getByOrder(UUID orderId) {
        return ledgerRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Ledger financeiro não encontrado para o pedido: " + orderId));
    }
}
