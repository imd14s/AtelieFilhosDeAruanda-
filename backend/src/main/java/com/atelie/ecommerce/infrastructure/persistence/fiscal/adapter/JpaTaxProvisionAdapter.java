package com.atelie.ecommerce.infrastructure.persistence.fiscal.adapter;

import com.atelie.ecommerce.domain.fiscal.model.TaxProvision;
import com.atelie.ecommerce.domain.fiscal.repository.TaxProvisionRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.TaxProvisionEntity;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.repository.JpaTaxProvisionRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JpaTaxProvisionAdapter implements TaxProvisionRepository {

    private final JpaTaxProvisionRepository repository;

    public JpaTaxProvisionAdapter(JpaTaxProvisionRepository repository) {
        this.repository = repository;
    }

    @Override
    public TaxProvision save(TaxProvision provision) {
        TaxProvisionEntity entity = TaxProvisionEntity.fromDomain(provision);
        if (entity.getId() == null)
            entity.setId(UUID.randomUUID());
        TaxProvisionEntity saved = repository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<TaxProvision> findByMonthAndYear(int month, int year) {
        return repository.findByMonthAndYear(month, year)
                .map(TaxProvisionEntity::toDomain);
    }

    @Override
    public List<TaxProvision> findAll() {
        return repository.findAll().stream()
                .map(TaxProvisionEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
