package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.entity.OrderEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private InventoryService inventoryService;

    @InjectMocks private OrderService orderService;

    @Test
    void shouldCreateOrderAndDeductStock() {
        // Setup
        UUID productId = UUID.randomUUID();
        ProductEntity product = new ProductEntity();
        product.setId(productId);
        product.setPrice(new BigDecimal("50.00"));

        CreateOrderRequest request = new CreateOrderRequest(
                OrderSource.INTERNAL, null, "John",
                List.of(new CreateOrderItemRequest(productId, 2))
        );

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        // Execução
        OrderEntity result = orderService.createOrder(request);

        // Validação
        assertEquals(new BigDecimal("100.00"), result.getTotalAmount());
        verify(inventoryService).addMovement(eq(productId), eq(MovementType.OUT), eq(2), anyString(), any());
        verify(orderRepository).save(any(OrderEntity.class));
    }

    @Test
    void shouldFailIfProductNotFound() {
        UUID productId = UUID.randomUUID();
        CreateOrderRequest request = new CreateOrderRequest(
                OrderSource.INTERNAL, null, "John",
                List.of(new CreateOrderItemRequest(productId, 1))
        );

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> orderService.createOrder(request));
        verifyNoInteractions(inventoryService); // Não deve tentar baixar estoque
    }
}
