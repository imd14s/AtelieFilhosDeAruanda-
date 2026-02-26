package com.atelie.ecommerce.domain.fiscal.ncm;

import com.atelie.ecommerce.domain.common.pagination.PageResult;

import java.util.List;
import java.util.Optional;

public interface NcmRepository {
    PageResult<Ncm> findAllByQuery(String query, int page, int size);

    Optional<Ncm> findByCode(String code);

    void saveAll(List<Ncm> ncms);
}
