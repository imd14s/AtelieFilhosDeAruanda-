package com.atelie.ecommerce.infrastructure.persistence.order.entity;

import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItemEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    // --- CORREÇÃO: Usando relacionamento ManyToOne em vez de ID solto ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
    }

    public OrderItemEntity() {}

    // --- CONSTRUTOR CORRIGIDO (ACEITA PRODUCT ENTITY) ---
    public OrderItemEntity(OrderEntity order, ProductEntity product, Integer quantity, BigDecimal unitPrice) {
        this.id = UUID.randomUUID();
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        if (unitPrice != null && quantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    // --- MÉTODOS DE RELACIONAMENTO ---
    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    // --- GETTERS (INCLUINDO getProduct PARA O CONTROLLER) ---
    public UUID getId() { return id; }
    public OrderEntity getOrder() { return order; }
    public ProductEntity getProduct() { return product; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}
