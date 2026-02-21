package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductSubscriptionRepository extends JpaRepository<ProductSubscriptionEntity, UUID> {
    List<ProductSubscriptionEntity> findByUserId(UUID userId);
}
