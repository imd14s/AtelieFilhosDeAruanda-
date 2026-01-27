package com.atelie.ecommerce.infrastructure.persistence.order.entity;

import com.atelie.ecommerce.domain.order.OrderSource;
import com.atelie.ecommerce.domain.order.OrderStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OrderSource source;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "customer_name")
    private String customerName;

    // --- CORREÇÃO DO BANCO (MANTIDA) ---
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // --- RELACIONAMENTO RESTAURADO ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (status == null) status = OrderStatus.PENDING;
    }

    public OrderEntity() {}

    // --- CONSTRUTOR RESTAURADO (USADO PELO SERVICE) ---
    public OrderEntity(OrderSource source, String externalId, String customerName, BigDecimal totalAmount) {
        this.id = UUID.randomUUID();
        this.status = OrderStatus.PENDING;
        this.source = source;
        this.externalId = externalId;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.createdAt = LocalDateTime.now();
    }

    // --- MÉTODOS AUXILIARES RESTAURADOS ---
    public void addItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this);
    }

    public List<OrderItemEntity> getItems() {
        return items;
    }

    // --- GETTERS & SETTERS BÁSICOS ---
    public UUID getId() { return id; }
    public OrderStatus getStatus() { return status; }
    public OrderSource getSource() { return source; }
    public String getExternalId() { return externalId; }
    public String getCustomerName() { return customerName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatus(OrderStatus status) { this.status = status; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
