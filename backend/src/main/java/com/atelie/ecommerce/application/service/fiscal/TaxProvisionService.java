package com.atelie.ecommerce.application.service.fiscal;

import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.model.TaxProvision;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.domain.fiscal.repository.TaxProvisionRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaFinancialLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TaxProvisionService {

    private final TaxProvisionRepository provisionRepository;
    private final JpaFinancialLedgerRepository ledgerJpaRepository;

    public TaxProvisionService(TaxProvisionRepository provisionRepository,
            JpaFinancialLedgerRepository ledgerJpaRepository) {
        this.provisionRepository = provisionRepository;
        this.ledgerJpaRepository = ledgerJpaRepository;
    }

    @Transactional
    public TaxProvision consolidateMonth(int month, int year) {
        // Busca todos os registros do Ledger para o período
        // Idealmente usaríamos um método customizado no Repository para filtrar por
        // data
        // Para o MVP, vamos assumir que o ledgerJpaRepository tem suporte ou filtrar
        // via lista

        // Simulação de busca por período (precisaríamos adicionar o campo de data no
        // Repositório JPA)
        List<FinancialLedger> ledgers = ledgerJpaRepository.findAll().stream()
                .map(entity -> entity.toDomain())
                .filter(l -> l.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).getMonthValue() == month)
                .filter(l -> l.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).getYear() == year)
                .toList();

        BigDecimal revenue = ledgers.stream().map(FinancialLedger::getGrossAmount).reduce(BigDecimal.ZERO,
                BigDecimal::add);
        BigDecimal taxes = ledgers.stream().map(FinancialLedger::getTaxesAmount).reduce(BigDecimal.ZERO,
                BigDecimal::add);
        BigDecimal icms = ledgers.stream().map(FinancialLedger::getIcmsAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pis = ledgers.stream().map(FinancialLedger::getPisAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cofins = ledgers.stream().map(FinancialLedger::getCofinsAmount).reduce(BigDecimal.ZERO,
                BigDecimal::add);
        BigDecimal netProfit = ledgers.stream().map(FinancialLedger::getNetAmount).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        TaxProvision provision = TaxProvision.builder()
                .id(UUID.randomUUID())
                .month(month)
                .year(year)
                .totalRevenue(revenue)
                .totalTaxes(taxes)
                .totalIcms(icms)
                .totalPis(pis)
                .totalCofins(cofins)
                .estimatedNetProfit(netProfit)
                .status("PROVISIONED")
                .build();

        return provisionRepository.save(provision);
    }

    public List<TaxProvision> getAll() {
        return provisionRepository.findAll();
    }
}
