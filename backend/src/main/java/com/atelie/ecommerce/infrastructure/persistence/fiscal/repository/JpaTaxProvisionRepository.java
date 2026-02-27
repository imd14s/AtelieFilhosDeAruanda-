package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.TaxProvisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface JpaTaxProvisionRepository extends JpaRepository<TaxProvisionEntity, UUID> {
    Optional<TaxProvisionEntity> findByMonthAndYear(int month, int year);
}
