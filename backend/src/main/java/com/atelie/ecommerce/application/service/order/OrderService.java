package com.atelie.ecommerce.application.service.order;

import com.atelie.ecommerce.application.common.exception.NotFoundException;
import com.atelie.ecommerce.application.dto.order.CreateOrderItemRequest;
import com.atelie.ecommerce.application.dto.order.CreateOrderRequest;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.application.service.fiscal.InvoiceService;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
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
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;
    private final com.atelie.ecommerce.application.service.audit.AuditService auditService;
    private final CommunicationService communicationService;
    private final InvoiceService invoiceService;
    private final com.atelie.ecommerce.application.service.shipping.ShippingLabelService shippingLabelService;

    public OrderService(OrderRepository orderRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            InventoryService inventoryService,
            com.atelie.ecommerce.application.service.audit.AuditService auditService,
            CommunicationService communicationService,
            InvoiceService invoiceService,
            com.atelie.ecommerce.application.service.shipping.ShippingLabelService shippingLabelService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.inventoryService = inventoryService;
        this.auditService = auditService;
        this.communicationService = communicationService;
        this.invoiceService = invoiceService;
        this.shippingLabelService = shippingLabelService;
    }

    @Transactional
    public OrderEntity processMarketplaceOrder(String source, String externalId, String customerName,
            String customerEmail, String customerDocument, String status,
            BigDecimal totalAmount, List<CreateOrderItemRequest> items) {
        // Idempotency check
        java.util.Optional<OrderEntity> existing = orderRepository.findByExternalIdAndSource(externalId, source);
        if (existing.isPresent()) {
            OrderEntity current = existing.get();
            // Update status if changed, but don't re-process stock
            if (!current.getStatus().equals(status)) {
                current.setStatus(status);
                orderRepository.save(current);
                auditService.log(
                        com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.UPDATE,
                        com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                        current.getId().toString(),
                        "Marketplace Order status updated to " + status);
            }
            return current;
        }

        // New Order
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setSource(source);
        order.setExternalId(externalId);
        order.setCustomerName(customerName);
        order.setCustomerEmail(customerEmail);
        order.setCustomerDocument(customerDocument);
        order.setStatus(status);
        order.setCreatedAt(Instant.now());
        order.setTotalAmount(totalAmount);

        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (CreateOrderItemRequest itemReq : items) {
            ProductEntity product = productRepository.findById(itemReq.productId())
                    .orElse((ProductEntity) null); // Allow missing products for external orders, but log it

            if (product == null) {
                // If product is not linked locally, create a placeholder item if needed, but we
                // can't deduct stock
                org.slf4j.LoggerFactory.getLogger(OrderService.class)
                        .warn("Product unlinked in ML Order. Skipping stock deduction for ML item.");
                continue;
            }

            UUID targetVariantId = itemReq.variantId();
            ProductVariantEntity variant = null;

            if (targetVariantId != null) {
                variant = variantRepository.findById(targetVariantId).orElse(null);
            } else {
                var variants = variantRepository.findByProductId(product.getId());
                if (!variants.isEmpty()) {
                    variant = variants.get(0);
                    targetVariantId = variant.getId();
                }
            }

            if (targetVariantId != null) {
                // Deduct stock
                inventoryService.addMovement(
                        targetVariantId,
                        MovementType.OUT,
                        itemReq.quantity(),
                        "Sale Order " + order.getId() + " (" + source + ")",
                        order.getId().toString());
            }

            BigDecimal itemPrice = (variant != null && variant.getPrice() != null) ? variant.getPrice()
                    : product.getPrice();
            BigDecimal itemTotal = itemPrice.multiply(new BigDecimal(itemReq.quantity()));

            OrderItemEntity itemEntity = new OrderItemEntity();
            itemEntity.setId(UUID.randomUUID());
            itemEntity.setOrder(order);
            itemEntity.setProduct(product);
            itemEntity.setVariant(variant);
            itemEntity.setQuantity(itemReq.quantity());
            itemEntity.setUnitPrice(itemPrice);
            itemEntity.setTotalPrice(itemTotal);

            orderItems.add(itemEntity);
        }

        order.setItems(orderItems);
        OrderEntity saved = orderRepository.save(order);

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.CREATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                saved.getId().toString(),
                "Marketplace Order imported from " + source + " for " + customerName);

        return saved;
    }

    @Transactional
    public OrderEntity createOrder(CreateOrderRequest request) {
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setSource(request.source());
        order.setExternalId(request.externalId() != null ? request.externalId() : order.getId().toString());
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setCustomerDocument(request.customerDocument());
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
                    order.getId().toString());

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

        // --- DADOS DE FRETE ---
        order.setShippingStreet(request.shippingStreet());
        order.setShippingNumber(request.shippingNumber());
        order.setShippingComplement(request.shippingComplement());
        order.setShippingNeighborhood(request.shippingNeighborhood());
        order.setShippingCity(request.shippingCity());
        order.setShippingState(request.shippingState());
        order.setShippingZipCode(request.shippingZipCode());
        order.setShippingCost(request.shippingCost());
        order.setShippingProvider(request.shippingProvider());

        OrderEntity saved = orderRepository.save(order);

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.CREATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                saved.getId().toString(),
                "Order created via " + request.source() + " for " + request.customerName());

        return saved;
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

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.UPDATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                orderId.toString(),
                "Order approved (PAID)");

        // Send confirmation email
        if (order.getCustomerEmail() != null) {
            communicationService.sendAutomation(
                    AutomationType.ORDER_CONFIRM,
                    order.getCustomerEmail(),
                    Map.of(
                            "customer_name", order.getCustomerName(),
                            "order_id", order.getExternalId()));
        }

        // Trigger automatisations
        invoiceService.emitInvoiceForOrder(orderId);
        shippingLabelService.generateLabelForOrder(orderId);
    }

    @Transactional
    public void markAsShipped(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        // Permite enviar se estiver PAGO. (Poderia permitir PENDENTE se for manual, mas
        // vamos forçar fluxo correto)
        if (!OrderStatus.PAID.name().equals(order.getStatus())) {
            throw new IllegalStateException("Pedido precisa estar PAGO para ser enviado");
        }
        order.setStatus(OrderStatus.SHIPPED.name());
        orderRepository.save(order);

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.UPDATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                orderId.toString(),
                "Order marked as SHIPPED");
    }

    @Transactional
    public void markAsDelivered(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        if (!OrderStatus.SHIPPED.name().equals(order.getStatus())) {
            throw new IllegalStateException("Pedido precisa estar ENVIADO para ser marcado como entregue");
        }
        order.setStatus(OrderStatus.DELIVERED.name());
        orderRepository.save(order);

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.UPDATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                orderId.toString(),
                "Order marked as DELIVERED (Finalized)");
    }

    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        // Se já foi pago ou enviado, lógica de estorno seria necessária (simplificado
        // aqui)
        if (OrderStatus.CANCELED.name().equals(order.getStatus()))
            return;

        // Estorno de estoque
        for (OrderItemEntity item : order.getItems()) {
            UUID variantId = item.getVariant() != null ? item.getVariant().getId() : null;
            if (variantId != null) {
                inventoryService.addMovement(variantId, MovementType.IN, item.getQuantity(),
                        "Order Cancelled: " + reason, orderId.toString());
            }
        }

        order.setStatus(OrderStatus.CANCELED.name());
        orderRepository.save(order);

        auditService.log(
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction.UPDATE,
                com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource.ORDER,
                orderId.toString(),
                "Order canceled. Reason: " + reason);
    }

    @Transactional(readOnly = true)
    public Page<OrderEntity> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<OrderEntity> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public OrderEntity getOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado: " + id));
    }
}
