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
    public void save(FinancialLedger ledger) {
        FinancialLedgerEntity entity = FinancialLedgerEntity.builder()
                .id(ledger.getId() != null ? ledger.getId() : UUID.randomUUID())
                .orderId(ledger.getOrderId())
                .grossAmount(ledger.getGrossAmount())
                .gatewayFee(ledger.getGatewayFee())
                .shippingCost(ledger.getShippingCost())
                .taxesAmount(ledger.getTaxesAmount())
                .netAmount(ledger.getNetAmount())
                .createdAt(ledger.getCreatedAt())
                .build();
        repository.save(entity);
    }

    @Override
    public Optional<FinancialLedger> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(this::toDomain);
    }

    @Override
    @Transactional
    public void deleteByOrderId(UUID orderId) {
        repository.deleteByOrderId(orderId);
    }

    private FinancialLedger toDomain(FinancialLedgerEntity entity) {
        return FinancialLedger.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .grossAmount(entity.getGrossAmount())
                .gatewayFee(entity.getGatewayFee())
                .shippingCost(entity.getShippingCost())
                .taxesAmount(entity.getTaxesAmount())
                .netAmount(entity.getNetAmount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
