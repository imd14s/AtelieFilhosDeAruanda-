package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {
    long countByCouponCodeAndUserId(String code, UUID userId);

    List<CouponUsage> findByUserId(UUID userId);
}
