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
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
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
    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        ProductVariantRepository variantRepository,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
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

            // --- CORREÇÃO DA LÓGICA DE VARIANTE ---
            UUID targetVariantId = itemReq.variantId();
            ProductVariantEntity variant;

            if (targetVariantId != null) {
                // Captura o ID em variável final para usar na lambda
                final UUID lookupId = targetVariantId;
                variant = variantRepository.findById(targetVariantId)
                    .orElseThrow(() -> new NotFoundException("Variante não encontrada: " + lookupId));
            } else {
                // Fallback: Tenta achar a variante default criada na migração
                var variants = variantRepository.findByProductId(product.getId());
                if (!variants.isEmpty()) {
                    variant = variants.get(0); // Pega a primeira/default
                    targetVariantId = variant.getId(); // Atualiza o ID alvo
                } else {
                    throw new IllegalStateException("Produto sem variantes cadastradas. Impossível baixar estoque.");
                }
            }

            // Baixa estoque na VARIANTE correta
            inventoryService.addMovement(
                    targetVariantId,
                    MovementType.OUT,
                    itemReq.quantity(),
                    "Sale Order " + order.getId(),
                    order.getId().toString()
            );

            // Preço: Usa o da variante se existir, senão usa do produto pai
            BigDecimal finalPrice = (variant.getPrice() != null) ? variant.getPrice() : product.getPrice();
            BigDecimal itemTotal = finalPrice.multiply(new BigDecimal(itemReq.quantity()));
            totalOrder = totalOrder.add(itemTotal);

            OrderItemEntity itemEntity = new OrderItemEntity();
            itemEntity.setId(UUID.randomUUID());
            itemEntity.setOrder(order);
            itemEntity.setProduct(product);
            itemEntity.setVariant(variant);
            itemEntity.setQuantity(itemReq.quantity());
            itemEntity.setUnitPrice(finalPrice);
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
            .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));
        
        if (!OrderStatus.PENDING.name().equals(order.getStatus())) {
             throw new IllegalStateException("Pedido não está pendente");
        }
        order.setStatus(OrderStatus.PAID.name());
        orderRepository.save(order);
    }
    
    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));
            
        // Se já foi pago ou enviado, lógica de estorno seria necessária (simplificado aqui)
        if (OrderStatus.CANCELED.name().equals(order.getStatus())) return;

        // Estorno de estoque
        for (OrderItemEntity item : order.getItems()) {
             UUID variantId = item.getVariant() != null ? item.getVariant().getId() : null;
             if (variantId != null) {
                 inventoryService.addMovement(variantId, MovementType.IN, item.getQuantity(), "Order Cancelled: " + reason, orderId.toString());
             }
        }

        order.setStatus(OrderStatus.CANCELED.name());
        orderRepository.save(order);
    }

    public Page<OrderEntity> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
}
