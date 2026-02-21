package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductViewHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductViewHistoryRepository
        extends JpaRepository<ProductViewHistoryEntity, ProductViewHistoryEntity.HistoryId> {
    List<ProductViewHistoryEntity> findByUserIdOrderByViewedAtDesc(UUID userId);
}
