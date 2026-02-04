package com.atelie.ecommerce.domain.order;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
}
