package com.atelie.ecommerce.domain.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.model.TaxProvision;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface TaxProvisionRepository {
    TaxProvision save(TaxProvision provision);

    Optional<TaxProvision> findByMonthAndYear(int month, int year);

    List<TaxProvision> findAll();

    void deleteById(UUID id);
}
