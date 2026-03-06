package com.atelie.ecommerce.infrastructure.persistence.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariantEntity v WHERE v.id = :id")
    Optional<ProductVariantEntity> findByIdWithLock(@Param("id") UUID id);

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
