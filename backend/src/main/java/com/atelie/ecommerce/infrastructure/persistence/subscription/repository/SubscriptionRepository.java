package com.atelie.ecommerce.infrastructure.persistence.subscription.repository;

import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, UUID> {
    List<SubscriptionEntity> findByUserId(UUID userId);

    List<SubscriptionEntity> findByStatus(String status);
}
