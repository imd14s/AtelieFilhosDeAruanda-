package com.atelie.ecommerce.domain.fiscal.ncm;

import java.util.List;
import java.util.Optional;

public interface NcmRepository {
    List<Ncm> findAllByQuery(String query, int limit);

    Optional<Ncm> findByCode(String code);
}
