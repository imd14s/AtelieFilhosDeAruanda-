package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, UUID> {
    
    List<ProductVariantEntity> findByProductId(UUID productId);
    boolean existsBySku(String sku);

    // Decremento Atômico no Nível da VARIANTE
    @Modifying
    @Query("UPDATE ProductVariantEntity v SET v.stockQuantity = v.stockQuantity - :quantity WHERE v.id = :id AND v.stockQuantity >= :quantity")
    int decrementStock(@Param("id") UUID id, @Param("quantity") int quantity);

    // Incremento Atômico
    @Modifying
    @Query("UPDATE ProductVariantEntity v SET v.stockQuantity = v.stockQuantity + :quantity WHERE v.id = :id")
    void incrementStock(@Param("id") UUID id, @Param("quantity") int quantity);
}
