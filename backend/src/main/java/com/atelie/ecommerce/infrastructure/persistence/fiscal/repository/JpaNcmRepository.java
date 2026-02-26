package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.NcmEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface JpaNcmRepository extends JpaRepository<NcmEntity, String> {

    @Query("SELECT n FROM NcmEntity n WHERE n.code LIKE :query% OR LOWER(n.description) LIKE %:query% " +
            "ORDER BY " +
            "CASE WHEN n.code = :query THEN 1 " +
            "     WHEN n.code LIKE :query% THEN 2 " +
            "     ELSE 3 END ASC, n.code ASC")
    Page<NcmEntity> searchByQuery(@Param("query") String query, Pageable pageable);

    Optional<NcmEntity> findByCode(String code);
}
