package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductFavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductFavoriteRepository
        extends JpaRepository<ProductFavoriteEntity, ProductFavoriteEntity.FavoriteId> {
    List<ProductFavoriteEntity> findByUserId(UUID userId);
}
