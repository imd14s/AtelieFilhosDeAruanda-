package com.atelie.ecommerce.infrastructure.persistence.product;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "marketplaces", "images" })
    Page<ProductEntity> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM ProductEntity p WHERE p.stockQuantity <= 5 AND p.alertEnabled = true")
    List<ProductEntity> findCriticalStock();

    java.util.Optional<ProductEntity> findBySlug(String slug);

    List<ProductEntity> findByCategory_Id(UUID categoryId);

    Page<ProductEntity> findByCategory_Id(UUID categoryId, Pageable pageable);

    Page<ProductEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);

    long countByActiveTrue();
}
