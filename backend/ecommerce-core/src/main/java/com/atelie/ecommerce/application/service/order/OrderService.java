package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public OrderEntity createOrder(CreateOrderRequest request) {
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setSource(request.source());
        order.setExternalId(request.externalId() != null ? request.externalId() : order.getId().toString());
        order.setCustomerName(request.customerName());
        order.setStatus(OrderStatus.PENDING.name());
        order.setCreatedAt(Instant.now());
        
        List<OrderItemEntity> items = new ArrayList<>();
        BigDecimal totalOrder = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.items()) {
            ProductEntity product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + itemReq.productId()));

            if (Boolean.FALSE.equals(product.getActive())) {
                throw new IllegalStateException("O produto '" + product.getName() + "' não está mais disponível.");
            }

            inventoryService.addMovement(
                    product.getId(),
                    MovementType.OUT,
                    itemReq.quantity(),
                    "Sale Order " + order.getId(),
                    order.getId().toString()
            );

            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemReq.quantity()));
            totalOrder = totalOrder.add(itemTotal);

            OrderItemEntity itemEntity = new OrderItemEntity();
            itemEntity.setId(UUID.randomUUID());
            itemEntity.setOrder(order);
            itemEntity.setProduct(product);
            itemEntity.setQuantity(itemReq.quantity());
            itemEntity.setUnitPrice(product.getPrice());
            itemEntity.setTotalPrice(itemTotal);
            
            items.add(itemEntity);
        }

        order.setTotalAmount(totalOrder);
        order.setItems(items);

        return orderRepository.save(order);
    }
    
    @Transactional
    public void approveOrder(UUID orderId) {
        try {
            OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NotFoundException("Order not found"));

            if (OrderStatus.CANCELED.name().equals(order.getStatus())) {
                throw new IllegalStateException("Pedido CANCELADO. Impossível aprovar.");
            }

            if (!OrderStatus.PAID.name().equals(order.getStatus())) {
                order.setStatus(OrderStatus.PAID.name());
                orderRepository.save(order);
                System.out.println("PEDIDO APROVADO: " + orderId);
            }
        } catch (OptimisticLockingFailureException e) {
            throw new ConflictException("O pedido foi modificado por outro processo. Tente novamente.");
        }
    }

    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        try {
            OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NotFoundException("Order not found"));

            if (OrderStatus.CANCELED.name().equals(order.getStatus())) return;
            if (OrderStatus.SHIPPED.name().equals(order.getStatus())) {
                throw new IllegalStateException("Impossível cancelar pedido enviado.");
            }

            for (OrderItemEntity item : order.getItems()) {
                inventoryService.addMovement(
                    item.getProduct().getId(),
                    MovementType.IN,
                    item.getQuantity(),
                    "Cancel Order " + orderId + ": " + reason,
                    orderId.toString()
                );
            }

            order.setStatus(OrderStatus.CANCELED.name());
            orderRepository.save(order);
            System.out.println("PEDIDO CANCELADO: " + orderId);
        } catch (OptimisticLockingFailureException e) {
            throw new ConflictException("Conflito de estado ao cancelar. Verifique o status atual.");
        }
    }

    // CORREÇÃO: Método paginado
    public Page<OrderEntity> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
}
