package com.atelie.ecommerce.infrastructure.persistence.product;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    
    @Query("SELECT p FROM ProductEntity p WHERE p.stockQuantity <= 5 AND p.alertEnabled = true")
    List<ProductEntity> findCriticalStock();

    // Lock Pessimista: Bloqueia a linha no DB para leitura/escrita até o fim da transação
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id")
    Optional<ProductEntity> findByIdWithLock(@Param("id") UUID id);
}
