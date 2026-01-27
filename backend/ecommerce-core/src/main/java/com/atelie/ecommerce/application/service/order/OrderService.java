package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderItemEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public OrderEntity createOrder(CreateOrderRequest request) {
        OrderEntity order = new OrderEntity(
                request.source(),
                request.externalId(),
                request.customerName(),
                BigDecimal.ZERO
        );

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemReq : request.items()) {
            ProductEntity product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + itemReq.productId()));

            inventoryService.addMovement(
                    product.getId(),
                    MovementType.OUT,
                    itemReq.quantity(),
                    "Sale - " + request.source(),
                    request.externalId()
            );

            OrderItemEntity orderItem = new OrderItemEntity(
                    order,
                    product,
                    itemReq.quantity(),
                    product.getPrice()
            );
            
            order.addItem(orderItem);
            
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemReq.quantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }
}
