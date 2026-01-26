package com.atelie.ecommerce.infrastructure.persistence.catalog.category;

import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {}
