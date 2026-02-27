package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.FinancialSnapshot;
import com.atelie.ecommerce.domain.fiscal.repository.FinancialSnapshotRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FinancialSnapshotEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaFinancialSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaFinancialSnapshotAdapter implements FinancialSnapshotRepository {

    private final JpaFinancialSnapshotRepository repository;

    @Override
    public void save(FinancialSnapshot snapshot) {
        repository.save(toEntity(snapshot));
    }

    @Override
    public Optional<FinancialSnapshot> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<FinancialSnapshot> findByPeriod(int month, int year) {
        return repository.findByMonthAndYear(month, year).map(this::toDomain);
    }

    @Override
    public List<FinancialSnapshot> findAll() {
        return repository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    private FinancialSnapshotEntity toEntity(FinancialSnapshot domain) {
        return FinancialSnapshotEntity.builder()
                .id(domain.getId())
                .month(domain.getMonth())
                .year(domain.getYear())
                .totalGrossAmount(domain.getTotalGrossAmount())
                .totalNetAmount(domain.getTotalNetAmount())
                .totalTaxesAmount(domain.getTotalTaxesAmount())
                .totalGatewayFees(domain.getTotalGatewayFees())
                .totalShippingCosts(domain.getTotalShippingCosts())
                .totalProductCosts(domain.getTotalProductCosts())
                .totalOrders(domain.getTotalOrders())
                .frozen(domain.isFrozen())
                .snapshotDate(domain.getSnapshotDate())
                .metadata(domain.getMetadata())
                .build();
    }

    private FinancialSnapshot toDomain(FinancialSnapshotEntity entity) {
        return FinancialSnapshot.builder()
                .id(entity.getId())
                .month(entity.getMonth())
                .year(entity.getYear())
                .totalGrossAmount(entity.getTotalGrossAmount())
                .totalNetAmount(entity.getTotalNetAmount())
                .totalTaxesAmount(entity.getTotalTaxesAmount())
                .totalGatewayFees(entity.getTotalGatewayFees())
                .totalShippingCosts(entity.getTotalShippingCosts())
                .totalProductCosts(entity.getTotalProductCosts())
                .totalOrders(entity.getTotalOrders())
                .frozen(entity.isFrozen())
                .snapshotDate(entity.getSnapshotDate())
                .metadata(entity.getMetadata())
                .build();
    }
}
