package com.atelie.ecommerce.infrastructure.persistence.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {

    /**
     * Busca categoria por nome (case-insensitive).
     */
    Optional<CategoryEntity> findByNameIgnoreCase(String name);

    /**
     * Verifica se existe categoria com o nome (case-insensitive).
     */
    boolean existsByNameIgnoreCase(String name);
}
