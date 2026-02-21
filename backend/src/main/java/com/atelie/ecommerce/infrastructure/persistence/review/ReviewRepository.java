package com.atelie.ecommerce.infrastructure.persistence.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, UUID> {
    List<ReviewEntity> findByProductIdAndStatus(UUID productId, String status);

    List<ReviewEntity> findByUserIdAndProductId(UUID userId, UUID productId);

    List<ReviewEntity> findByUserId(UUID userId);
}
