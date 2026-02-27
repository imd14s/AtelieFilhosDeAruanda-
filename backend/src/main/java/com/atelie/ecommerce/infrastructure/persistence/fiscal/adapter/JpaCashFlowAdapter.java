package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.CashFlowEntry;
import com.atelie.ecommerce.domain.fiscal.repository.CashFlowRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.CashFlowEntryEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaCashFlowRepository;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JpaCashFlowAdapter implements CashFlowRepository {
    private final JpaCashFlowRepository repository;

    public JpaCashFlowAdapter(JpaCashFlowRepository repository) {
        this.repository = repository;
    }

    @Override
    public CashFlowEntry save(CashFlowEntry entry) {
        CashFlowEntryEntity entity = CashFlowEntryEntity.fromDomain(entry);
        return repository.save(entity).toDomain();
    }

    @Override
    public Optional<CashFlowEntry> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(CashFlowEntryEntity::toDomain);
    }

    @Override
    public Optional<CashFlowEntry> findByExternalId(String externalId) {
        return repository.findByExternalId(externalId).map(CashFlowEntryEntity::toDomain);
    }

    @Override
    public List<CashFlowEntry> findAllPendingUntil(Instant date) {
        return repository.findByStatusAndExpectedReleaseDateBefore(CashFlowEntry.CashFlowStatus.PENDING, date)
                .stream().map(CashFlowEntryEntity::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<CashFlowEntry> findAllAvailable() {
        return repository.findByStatus(CashFlowEntry.CashFlowStatus.AVAILABLE)
                .stream().map(CashFlowEntryEntity::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteByOrderId(UUID orderId) {
        repository.findByOrderId(orderId).ifPresent(repository::delete);
    }
}
