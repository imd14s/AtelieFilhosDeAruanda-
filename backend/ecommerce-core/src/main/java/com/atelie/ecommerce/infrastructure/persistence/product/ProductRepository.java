package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    // Decremento Atômico: Retorna 1 se sucesso (estoque suficiente), 0 se falha (estoque insuficiente)
    @Modifying
    @Query("UPDATE ProductEntity p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decrementStock(@Param("id") UUID id, @Param("quantity") int quantity);

    // Incremento Atômico
    @Modifying
    @Query("UPDATE ProductEntity p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.id = :id")
    void incrementStock(@Param("id") UUID id, @Param("quantity") int quantity);
}
