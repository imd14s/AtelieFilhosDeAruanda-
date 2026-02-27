package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.model.FinancialSnapshot;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotService {

    private final FinancialLedgerRepository ledgerRepository;
    private final FinancialSnapshotRepository snapshotRepository;

    /**
     * Gera um snapshot consolidado de um mês/ano específico.
     */
    @Transactional
    public FinancialSnapshot takeSnapshot(int month, int year) {
        log.info("Iniciando geração de snapshot para {}/{}", month, year);

        // Calcular início e fim do mês
        LocalDate startLocalDate = LocalDate.of(year, month, 1);
        LocalDate endLocalDate = startLocalDate.plusMonths(1).minusDays(1);

        Instant start = startLocalDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = endLocalDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        List<FinancialLedger> ledgers = ledgerRepository.findAllInPeriod(start, end);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalTaxes = BigDecimal.ZERO;
        BigDecimal totalFees = BigDecimal.ZERO;
        BigDecimal totalShipping = BigDecimal.ZERO;
        BigDecimal totalProduct = BigDecimal.ZERO;

        for (FinancialLedger l : ledgers) {
            totalGross = totalGross.add(l.getGrossAmount());
            totalNet = totalNet.add(l.getNetAmount());
            totalTaxes = totalTaxes.add(l.getTaxesAmount());
            totalFees = totalFees.add(l.getGatewayFee());
            totalShipping = totalShipping.add(l.getShippingCost());
            totalProduct = totalProduct.add(l.getProductCost());
        }

        FinancialSnapshot snapshot = FinancialSnapshot.builder()
                .id(UUID.randomUUID())
                .month(month)
                .year(year)
                .totalGrossAmount(totalGross)
                .totalNetAmount(totalNet)
                .totalTaxesAmount(totalTaxes)
                .totalGatewayFees(totalFees)
                .totalShippingCosts(totalShipping)
                .totalProductCosts(totalProduct)
                .totalOrders(ledgers.size())
                .frozen(false)
                .snapshotDate(Instant.now())
                .build();

        snapshotRepository.save(snapshot);
        log.info("Snapshot gerado com sucesso para {}/{}: ID {}", month, year, snapshot.getId());

        return snapshot;
    }

    /**
     * Congela o período, impedindo alterações retroativas nos dados de auditoria.
     */
    @Transactional
    public void freezePeriod(int month, int year) {
        snapshotRepository.findByPeriod(month, year).ifPresent(s -> {
            FinancialSnapshot frozen = FinancialSnapshot.builder()
                    .id(s.getId())
                    .month(s.getMonth())
                    .year(s.getYear())
                    .totalGrossAmount(s.getTotalGrossAmount())
                    .totalNetAmount(s.getTotalNetAmount())
                    .totalTaxesAmount(s.getTotalTaxesAmount())
                    .totalGatewayFees(s.getTotalGatewayFees())
                    .totalShippingCosts(s.getTotalShippingCosts())
                    .totalProductCosts(s.getTotalProductCosts())
                    .totalOrders(s.getTotalOrders())
                    .frozen(true)
                    .snapshotDate(s.getSnapshotDate())
                    .metadata(s.getMetadata())
                    .build();

            snapshotRepository.save(frozen);
            log.info("Período {}/{} CONGELADO para auditoria.", month, year);
        });
    }
}
