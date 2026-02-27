package com.atelie.ecommerce.infrastructure.persistence.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewTokenRepository extends JpaRepository<ReviewTokenEntity, UUID> {
    Optional<ReviewTokenEntity> findByToken(String token);

    boolean existsByOrderIdAndProductId(UUID orderId, UUID productId);
}
