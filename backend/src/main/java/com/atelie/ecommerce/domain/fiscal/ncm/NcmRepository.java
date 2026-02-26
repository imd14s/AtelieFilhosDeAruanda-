package com.atelie.ecommerce.domain.fiscal.ncm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NcmRepository {
    List<Ncm> findAllByQuery(String query, int limit);

    Optional<Ncm> findByCode(String code);

    Optional<Ncm> findById(UUID id);
}
