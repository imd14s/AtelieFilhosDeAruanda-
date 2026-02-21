package com.atelie.ecommerce.infrastructure.persistence.subscription.repository;

import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, UUID> {
    List<SubscriptionPlanEntity> findByActiveTrue();
}
