package com.atelie.ecommerce.application.service.order;

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

            // --- CORREÇÃO DE NEGÓCIO: Impede compra de produto arquivado/inativo ---
            if (Boolean.FALSE.equals(product.getActive())) {
                throw new IllegalStateException("O produto '" + product.getName() + "' não está mais disponível para venda.");
            }

            // Reserva Estoque (Atômico)
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
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (OrderStatus.CANCELED.name().equals(order.getStatus())) {
            throw new IllegalStateException("Tentativa de aprovar pedido CANCELADO. Verifique o estoque manualmente.");
        }

        if (!OrderStatus.PAID.name().equals(order.getStatus())) {
            order.setStatus(OrderStatus.PAID.name());
            orderRepository.save(order);
            System.out.println("PEDIDO APROVADO: " + orderId);
        }
    }

    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (OrderStatus.CANCELED.name().equals(order.getStatus())) {
            return;
        }
        
        if (OrderStatus.SHIPPED.name().equals(order.getStatus())) {
            throw new IllegalStateException("Não é possível cancelar pedido já enviado.");
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
        System.out.println("PEDIDO CANCELADO E ESTOQUE ESTORNADO: " + orderId);
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }
}
