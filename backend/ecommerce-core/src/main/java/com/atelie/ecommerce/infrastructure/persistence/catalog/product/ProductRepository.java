package com.atelie.ecommerce.infrastructure.persistence.catalog.product;

import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {}
