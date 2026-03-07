package com.atelie.ecommerce.api.order;

import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.api.order.dto.OrderResponse;
import com.atelie.ecommerce.api.order.dto.OrderItemResponse;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.application.service.order.ReverseLogisticsService;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final ReverseLogisticsService reverseLogisticsService;

    public OrderController(OrderService orderService, ReverseLogisticsService reverseLogisticsService) {
        this.orderService = orderService;
        this.reverseLogisticsService = reverseLogisticsService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderEntity created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.getAllOrders(pageable).map(this::toResponse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<OrderResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(orderService.getOrderById(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveOrder(@PathVariable UUID id) {
        orderService.approveOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID id, @RequestBody(required = false) String reason, Authentication authentication) {
        OrderEntity order = orderService.getOrderById(id);
        
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin) {
            if (authentication == null) {
                throw new AccessDeniedException("Autenticação necessária.");
            }
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            if (order.getUser() == null || !order.getUser().getId().toString().equals(principal.getId())) {
                throw new AccessDeniedException("Você não tem permissão para cancelar este pedido.");
            }
        }

        orderService.cancelOrder(id, reason != null ? reason : "Cancelado pelo usuário");
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<Void> markAsShipped(@PathVariable UUID id) {
        orderService.markAsShipped(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<Void> markAsDelivered(@PathVariable UUID id) {
        orderService.markAsDelivered(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reverse-logistics")
    public ResponseEntity<Map<String, Object>> createReverseLabel(@PathVariable UUID id, @RequestParam Integer serviceId) {
        return ResponseEntity.ok(reverseLogisticsService.createReverseLabel(id, serviceId));
    }

    // Mapper Simples
    private OrderResponse toResponse(OrderEntity entity) {
        var items = entity.getItems().stream()
                .map(i -> {
                    String productName = i.getProductName();
                    UUID productId = null;
                    String imageUrl = "/images/default.png";
                    UUID variantId = null;

                    if (i.getVariant() != null) {
                        variantId = i.getVariant().getId();
                        if (i.getVariant().getImages() != null && !i.getVariant().getImages().isEmpty()) {
                            imageUrl = i.getVariant().getImages().stream()
                                    .filter(url -> !ProductEntity.isVideoUrl(url))
                                    .findFirst()
                                    .orElse(i.getVariant().getImages().get(0));
                        } else if (i.getVariant().getImageUrl() != null) {
                            imageUrl = i.getVariant().getImageUrl();
                        }
                    }

                    if (i.getProduct() != null) {
                        productId = i.getProduct().getId();
                        if (productName == null || productName.isEmpty()) {
                            productName = i.getProduct().getName();
                        }
                        if (imageUrl.equals("/images/default.png")) {
                            imageUrl = i.getProduct().getImageUrl();
                        }
                    }

                    if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("/") && !imageUrl.equals("/images/default.png")) {
                        imageUrl = "/uploads/" + imageUrl;
                    }

                    return new OrderItemResponse(
                            productId,
                            productName,
                            i.getQuantity(),
                            i.getUnitPrice(),
                            i.getTotalPrice(),
                            imageUrl,
                            variantId);
                })
                .collect(Collectors.toList());

        String address = entity.getShippingStreet() != null
                ? String.format("%s, %s%s - %s, %s - %s, %s",
                        entity.getShippingStreet(),
                        entity.getShippingNumber(),
                        entity.getShippingComplement() != null && !entity.getShippingComplement().isEmpty()
                                ? " (" + entity.getShippingComplement() + ")"
                                : "",
                        entity.getShippingNeighborhood(),
                        entity.getShippingCity(),
                        entity.getShippingState(),
                        entity.getShippingZipCode())
                : null;

        return new OrderResponse(
                entity.getId(),
                parseStatus(entity.getStatus()),
                entity.getSource(),
                entity.getExternalId(),
                entity.getCustomerName(),
                entity.getTotalAmount(),
                entity.getShippingCost(),
                address,
                entity.getShippingProvider(),
                entity.getPaymentMethod(),
                null,
                entity.getDiscount() != null ? entity.getDiscount() : BigDecimal.ZERO,
                entity.getCreatedAt() != null
                        ? entity.getCreatedAt().atZone(java.time.ZoneId.of("UTC")).toLocalDateTime()
                        : java.time.LocalDateTime.now(),
                items,
                entity.getInvoiceUrl(),
                entity.getLabelUrlMe(),
                entity.getLabelUrlCustom(),
                entity.getTrackingCode(),
                entity.getShippingIdExternal(),
                entity.getCancelReason(),
                entity.getReverseTrackingCode());
    }

    private OrderStatus parseStatus(String status) {
        if (status == null) return OrderStatus.PENDING;
        try {
            if ("CANCELLED".equalsIgnoreCase(status)) return OrderStatus.CANCELED;
            return OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OrderStatus.PENDING;
        }
    }
}
