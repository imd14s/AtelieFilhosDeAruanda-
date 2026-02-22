package com.atelie.ecommerce.infrastructure.persistence.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {
    void deleteByCartId(UUID cartId);
}
