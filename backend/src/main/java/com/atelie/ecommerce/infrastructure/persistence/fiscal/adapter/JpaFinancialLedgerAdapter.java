package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FinancialLedgerEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaFinancialLedgerRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Component
public class JpaFinancialLedgerAdapter implements FinancialLedgerRepository {

    private final JpaFinancialLedgerRepository repository;

    public JpaFinancialLedgerAdapter(JpaFinancialLedgerRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public FinancialLedger save(FinancialLedger ledger) {
        FinancialLedgerEntity entity = FinancialLedgerEntity.fromDomain(ledger);
        FinancialLedgerEntity saved = repository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<FinancialLedger> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId)
                .map(FinancialLedgerEntity::toDomain);
    }

    @Override
    public java.util.List<FinancialLedger> findAllInPeriod(java.time.Instant start, java.time.Instant end) {
        return repository.findByCreatedAtBetween(start, end).stream()
                .map(FinancialLedgerEntity::toDomain)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteByOrderId(UUID orderId) {
        repository.deleteByOrderId(orderId);
    }
}
