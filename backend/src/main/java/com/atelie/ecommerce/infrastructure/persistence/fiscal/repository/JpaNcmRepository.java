package com.atelie.ecommerce.infrastructure.persistence.fiscal.repository;

import com.atelie.ecommerce.infrastructure.persistence.fiscal.entity.NcmEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaNcmRepository extends JpaRepository<NcmEntity, UUID> {

    @Query("SELECT n FROM NcmEntity n WHERE n.code LIKE :query% OR LOWER(n.description) LIKE %:query% ORDER BY n.code ASC")
    List<NcmEntity> searchByQuery(@Param("query") String query, Pageable pageable);

    Optional<NcmEntity> findByCode(String code);
}
