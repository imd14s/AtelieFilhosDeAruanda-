package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.domain.common.pagination.PageResult;
import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.NcmEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    public PageResult<Ncm> findAllByQuery(String query, int page, int size) {
        Page<NcmEntity> entityPage = jpaRepository.searchByQuery(query.toLowerCase(), PageRequest.of(page, size));

        List<Ncm> content = entityPage.getContent().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());

        return new PageResult<>(
                content,
                entityPage.getTotalElements(),
                entityPage.getTotalPages(),
                entityPage.getNumber(),
                entityPage.getSize());
    }

    @Override
    public Optional<Ncm> findByCode(String code) {
        return jpaRepository.findByCode(code).map(this::toDomain);
    }

    @Override
    public void saveAll(List<Ncm> ncms) {
        List<NcmEntity> entities = ncms.stream()
                .map(n -> NcmEntity.builder()
                        .code(n.code())
                        .description(n.description())
                        .build())
                .collect(Collectors.toList());

        jpaRepository.saveAll(entities);
    }

    private Ncm toDomain(NcmEntity entity) {
        return new Ncm(entity.getCode(), entity.getDescription());
    }
}
