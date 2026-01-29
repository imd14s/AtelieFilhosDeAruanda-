package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    
    // Otimização: Busca paginada
    Page<ProductEntity> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM ProductEntity p WHERE p.stockQuantity <= 5 AND p.alertEnabled = true")
    List<ProductEntity> findCriticalStock();

    @Modifying
    @Query("UPDATE ProductEntity p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decrementStock(@Param("id") UUID id, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE ProductEntity p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.id = :id")
    void incrementStock(@Param("id") UUID id, @Param("quantity") int quantity);
}
