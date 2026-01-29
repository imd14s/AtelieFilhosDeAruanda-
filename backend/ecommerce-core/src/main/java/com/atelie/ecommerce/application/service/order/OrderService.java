package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Método que o Controller de Pedidos usa
    public OrderEntity saveOrder(OrderEntity order) {
        return orderRepository.save(order);
    }

    // Método que o Webhook estava procurando
    public OrderEntity createOrder(OrderEntity order) {
        return orderRepository.save(order);
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<OrderEntity> findById(UUID id) {
        return orderRepository.findById(id);
    }
}
