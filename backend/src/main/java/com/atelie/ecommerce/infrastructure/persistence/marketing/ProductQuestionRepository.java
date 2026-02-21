package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestionEntity, UUID> {
    List<ProductQuestionEntity> findByUserId(UUID userId);

    List<ProductQuestionEntity> findByProductId(UUID productId);
}
