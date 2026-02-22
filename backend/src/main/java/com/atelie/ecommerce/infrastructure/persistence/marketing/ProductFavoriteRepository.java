package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductFavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.atelie.ecommerce.api.marketing.dto.FavoriteRankingDTO;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductFavoriteRepository
                extends JpaRepository<ProductFavoriteEntity, ProductFavoriteEntity.FavoriteId> {
        List<ProductFavoriteEntity> findByUserId(UUID userId);

        List<ProductFavoriteEntity> findByProductId(UUID productId);

        @Query("SELECT new com.atelie.ecommerce.api.marketing.dto.FavoriteRankingDTO(" +
                        "p.id, p.name, p.mainImage, p.price, COUNT(f)) " +
                        "FROM ProductFavoriteEntity f JOIN f.product p " +
                        "GROUP BY p.id, p.name, p.mainImage, p.price " +
                        "ORDER BY COUNT(f) DESC")
        List<FavoriteRankingDTO> findFavoriteRanking();
}
