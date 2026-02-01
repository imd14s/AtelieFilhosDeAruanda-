package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.domain.order.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.domain.inventory.MovementType;
import java.math.BigDecimal;
import java.util.List;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCancelOrder() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING.name());
        // Correção: Inicializa a lista de itens para evitar NullPointerException [cite:
        // 331]
        order.setItems(new ArrayList<>());

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(order);

        orderService.cancelOrder(orderId, "Teste de cancelamento");

        verify(orderRepository, times(1)).save(any(OrderEntity.class));
    }

    @Test
    void shouldCreateOrderSuccessfully_WithVariantStockDown() {
        // CENÁRIO
        UUID productId = UUID.randomUUID();
        UUID variantId = UUID.randomUUID();
        
        // Produto Mock
        ProductEntity product = new ProductEntity();
        product.setId(productId);
        product.setPrice(new BigDecimal("100.00"));
        product.setActive(true);
        product.setName("Produto Teste");

        // Variante Mock
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setId(variantId);
        variant.setPrice(new BigDecimal("100.00")); // Preço da variante
        variant.setProduct(product);
        variant.setStockQuantity(10);

        // Request
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(productId, variantId, 2);
        CreateOrderRequest request = new CreateOrderRequest(
            "WEB", 
            "EXT-123", 
            "Cliente Teste", 
            List.of(itemReq)
        );

        // MOCKS
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(variantRepository.findById(variantId)).thenReturn(Optional.of(variant));
        // O save deve retornar o objeto que foi passado (ou um novo com ID)
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(invocation -> {
            OrderEntity order = invocation.getArgument(0);
            if(order.getId() == null) order.setId(UUID.randomUUID()); // Simula geração de ID
            return order;
        });

        // EXECUÇÃO
        OrderEntity createdOrder = orderService.createOrder(request);

        // VALIDAÇÕES (Asserts)
        assertNotNull(createdOrder);
        assertEquals("PENDING", createdOrder.getStatus());
        // 2 itens * 100.00 = 200.00
        assertEquals(new BigDecimal("200.00"), createdOrder.getTotalAmount());

        // Verifica se baixou estoque corretamente (Critical Path)
        verify(inventoryService, times(1)).addMovement(
            eq(variantId), 
            eq(MovementType.OUT), 
            eq(2), 
            contains("Sale Order"), 
            anyString()
        );
        
        // Verifica persistência
        verify(orderRepository, times(1)).save(any(OrderEntity.class));
    }
    
    @Test
    void shouldThrowException_WhenProductInactive() {
        UUID productId = UUID.randomUUID();
        ProductEntity product = new ProductEntity();
        product.setId(productId);
        product.setActive(false); // Inativo

        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(productId, null, 1);
        CreateOrderRequest request = new CreateOrderRequest("WEB", "123", "User", List.of(itemReq));

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
        verify(orderRepository, never()).save(any());
    }
}
