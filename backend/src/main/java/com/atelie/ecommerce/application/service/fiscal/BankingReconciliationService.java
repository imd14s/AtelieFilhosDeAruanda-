package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.domain.fiscal.model.BankingReconciliation;
import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import com.atelie.ecommerce.domain.fiscal.repository.BankingReconciliationRepository;
import com.atelie.ecommerce.domain.fiscal.repository.CashFlowRepository;
import com.atelie.ecommerce.application.serviceengine.driver.payment.MercadoPagoPaymentDriver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankingReconciliationService {

    private final CashFlowRepository cashFlowRepository;
    private final BankingReconciliationRepository reconciliationRepository;
    private final MercadoPagoPaymentDriver mpDriver;

    @Transactional
    public void syncGateways() {
        log.info("Iniciando sincronização de conciliação bancária...");

        // 1. Buscar entradas pendentes
        List<CashFlowEntry> pendingEntries = cashFlowRepository.findAllPendingUntil(Instant.now());

        for (CashFlowEntry entry : pendingEntries) {
            if ("MERCADO_PAGO".equals(entry.getGateway())) {
                syncMercadoPagoEntry(entry);
            }
        }
    }

    private void syncMercadoPagoEntry(CashFlowEntry entry) {
        // Em um sistema real, as configurações viriam de um serviço de configuração
        Map<String, Object> config = new HashMap<>();

        Map<String, Object> details = mpDriver.getPaymentDetails(entry.getExternalId(), config);

        if (details == null)
            return;

        String status = (String) details.get("status");
        BigDecimal netReceived = new BigDecimal(details.get("net_received_amount").toString());
        String releaseDateStr = (String) details.get("money_release_date");
        Instant releaseDate = releaseDateStr != null ? Instant.parse(releaseDateStr) : null;

        // Verificar discrepâncias
        if (netReceived.compareTo(entry.getNetAmount()) != 0) {
            log.warn("Discrepância encontrada no pedido {}: Esperado {}, Recebido {}",
                    entry.getOrderId(), entry.getNetAmount(), netReceived);

            createReconciliationRecord(entry, netReceived, "Diferença de taxas ou antecipação não prevista");
        }

        // Atualizar status da entrada de fluxo de caixa
        CashFlowEntry.CashFlowStatus nextStatus = entry.getStatus();
        if ("approved".equals(status)) {
            if (releaseDate != null && releaseDate.isBefore(Instant.now())) {
                nextStatus = CashFlowEntry.CashFlowStatus.AVAILABLE;
            } else {
                nextStatus = CashFlowEntry.CashFlowStatus.PENDING;
            }
        } else if ("cancelled".equals(status) || "refunded".equals(status) || "charged_back".equals(status)) {
            nextStatus = CashFlowEntry.CashFlowStatus.CANCELED;
            createReconciliationRecord(entry, netReceived, "Estorno/Chargeback detectado");
        }

        CashFlowEntry updated = CashFlowEntry.builder()
                .id(entry.getId())
                .orderId(entry.getOrderId())
                .externalId(entry.getExternalId())
                .grossAmount(entry.getGrossAmount())
                .netAmount(netReceived) // Atualiza com o valor real recebido
                .totalFees(entry.getGrossAmount().subtract(netReceived))
                .type(entry.getType())
                .status(nextStatus)
                .expectedReleaseDate(releaseDate != null ? releaseDate : entry.getExpectedReleaseDate())
                .actualReleaseDate(nextStatus == CashFlowEntry.CashFlowStatus.AVAILABLE ? Instant.now() : null)
                .gateway(entry.getGateway())
                .createdAt(entry.getCreatedAt())
                .build();

        cashFlowRepository.save(updated);
    }

    private void createReconciliationRecord(CashFlowEntry entry, BigDecimal gatewayAmount, String reason) {
        BankingReconciliation reconciliation = BankingReconciliation.builder()
                .id(UUID.randomUUID())
                .orderId(entry.getOrderId())
                .externalId(entry.getExternalId())
                .systemAmount(entry.getNetAmount())
                .gatewayAmount(gatewayAmount)
                .feeDifference(entry.getNetAmount().subtract(gatewayAmount))
                .status(BankingReconciliation.ReconciliationStatus.DISCREPANCY)
                .discrepancyReason(reason)
                .reconciledAt(Instant.now())
                .build();

        reconciliationRepository.save(reconciliation);
    }
}
