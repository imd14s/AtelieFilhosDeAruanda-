package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductFavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.FavoriteRankingProjection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductFavoriteRepository
                extends JpaRepository<ProductFavoriteEntity, ProductFavoriteEntity.FavoriteId> {
        List<ProductFavoriteEntity> findByUserId(UUID userId);

        List<ProductFavoriteEntity> findByProductId(UUID productId);

        @Query("SELECT p.id as productId, p.name as productName, p.imageUrl as productImage, p.price as productPrice, COUNT(f) as favCount "
                        +
                        "FROM ProductFavoriteEntity f JOIN f.product p " +
                        "GROUP BY p.id, p.name, p.imageUrl, p.price " +
                        "ORDER BY COUNT(f) DESC")
        List<FavoriteRankingProjection> findFavoriteRanking();
}
