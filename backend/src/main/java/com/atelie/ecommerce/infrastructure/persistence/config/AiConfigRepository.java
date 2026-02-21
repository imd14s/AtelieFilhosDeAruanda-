package com.atelie.ecommerce.infrastructure.persistence.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiConfigRepository extends JpaRepository<AiConfigEntity, UUID> {
    Optional<AiConfigEntity> findByNomeIaIgnoreCase(String nomeIa);
}
