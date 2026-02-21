package com.atelie.ecommerce.infrastructure.persistence.customer.repository;

import com.atelie.ecommerce.infrastructure.persistence.customer.entity.UserAddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddressEntity, UUID> {
    List<UserAddressEntity> findByUserId(UUID userId);

    List<UserAddressEntity> findByUserIdAndIsDefaultTrue(UUID userId);
}
