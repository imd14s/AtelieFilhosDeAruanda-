package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.FinancialSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaFinancialSnapshotRepository extends JpaRepository<FinancialSnapshotEntity, UUID> {
    Optional<FinancialSnapshotEntity> findByMonthAndYear(int month, int year);
}
