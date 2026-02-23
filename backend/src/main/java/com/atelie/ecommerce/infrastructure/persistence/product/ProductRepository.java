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

        @Query(value = "SELECT * FROM products WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('portuguese', :query)", countQuery = "SELECT count(*) FROM products WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('portuguese', :query)", nativeQuery = true)
        Page<ProductEntity> fullTextSearch(@org.springframework.data.repository.query.Param("query") String query,
                        Pageable pageable);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "marketplaces", "images" })
        @Query("SELECT p FROM ProductEntity p JOIN p.marketplaces m WHERE m.code = :code AND p.active = true")
        Page<ProductEntity> findByMarketplaces_CodeAndActiveTrue(
                        @org.springframework.data.repository.query.Param("code") String code, Pageable pageable);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "marketplaces", "images" })
        @Query("SELECT p FROM ProductEntity p JOIN p.marketplaces m WHERE m.code = :code AND p.category.id = :categoryId AND p.active = true")
        Page<ProductEntity> findByMarketplaces_CodeAndCategory_IdAndActiveTrue(
                        @org.springframework.data.repository.query.Param("code") String code,
                        @org.springframework.data.repository.query.Param("categoryId") UUID categoryId,
                        Pageable pageable);

        long countByActiveTrue();
}
