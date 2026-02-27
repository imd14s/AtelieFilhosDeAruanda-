package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.BankingReconciliation;
import com.atelie.ecommerce.domain.fiscal.repository.BankingReconciliationRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.BankingReconciliationEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaBankingReconciliationRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JpaBankingReconciliationAdapter implements BankingReconciliationRepository {
    private final JpaBankingReconciliationRepository repository;

    public JpaBankingReconciliationAdapter(JpaBankingReconciliationRepository repository) {
        this.repository = repository;
    }

    @Override
    public BankingReconciliation save(BankingReconciliation reconciliation) {
        BankingReconciliationEntity entity = BankingReconciliationEntity.fromDomain(reconciliation);
        return repository.save(entity).toDomain();
    }

    @Override
    public Optional<BankingReconciliation> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(BankingReconciliationEntity::toDomain);
    }

    @Override
    public List<BankingReconciliation> findAll() {
        return repository.findAll().stream().map(BankingReconciliationEntity::toDomain).collect(Collectors.toList());
    }
}
