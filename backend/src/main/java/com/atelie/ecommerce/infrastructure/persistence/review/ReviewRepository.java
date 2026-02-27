package com.atelie.ecommerce.infrastructure.persistence.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, UUID> {
    List<ReviewEntity> findByProductIdAndStatus(UUID productId, String status);

    List<ReviewEntity> findByUserIdAndProductId(UUID userId, UUID productId);

    List<ReviewEntity> findByUserId(UUID userId);

    Page<ReviewEntity> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<ReviewEntity> findAllByRatingInOrderByCreatedAtDesc(List<Integer> ratings, Pageable pageable);

    @Query("SELECT r FROM ReviewEntity r WHERE r.media IS NOT EMPTY ORDER BY r.createdAt DESC")
    Page<ReviewEntity> findAllWithMediaOrderByCreatedAtDesc(Pageable pageable);

    Page<ReviewEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
