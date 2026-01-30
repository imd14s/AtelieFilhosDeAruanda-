package com.atelie.ecommerce.infrastructure.persistence.auth;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
}
