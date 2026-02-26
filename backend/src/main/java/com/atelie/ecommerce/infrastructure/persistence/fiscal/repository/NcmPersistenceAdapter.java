package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.NcmEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NcmPersistenceAdapter implements NcmRepository {

    private final JpaNcmRepository jpaRepository;

    @Override
    public List<Ncm> findAllByQuery(String query, int limit) {
        return jpaRepository.searchByQuery(query.toLowerCase(), PageRequest.of(0, limit))
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Ncm> findByCode(String code) {
        return jpaRepository.findByCode(code).map(this::toDomain);
    }

    private Ncm toDomain(NcmEntity entity) {
        return new Ncm(entity.getCode(), entity.getDescription());
    }
}
