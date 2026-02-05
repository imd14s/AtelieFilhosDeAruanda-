package com.atelie.ecommerce.infrastructure.persistence.marketing;

import com.atelie.ecommerce.domain.marketing.model.AbandonedCartConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AbandonedCartConfigRepository extends JpaRepository<AbandonedCartConfig, UUID> {
}
