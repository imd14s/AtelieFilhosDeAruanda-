package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCode(String code);

    List<Coupon> findByOwnerIdOrOwnerIdIsNullAndActiveTrue(UUID ownerId);
}
