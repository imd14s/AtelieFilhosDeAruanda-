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
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSource source;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = OrderStatus.PENDING;
    }

    public OrderEntity() {}

    public OrderEntity(OrderSource source, String externalId, String customerName, BigDecimal totalAmount) {
        this.source = source;
        this.externalId = externalId;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = OrderStatus.PENDING;
    }

    public void addItem(OrderItemEntity item) {
        items.add(item);
    }

    // Getters
    public UUID getId() { return id; }
    public OrderStatus getStatus() { return status; }
    public OrderSource getSource() { return source; }
    public String getExternalId() { return externalId; }
    public String getCustomerName() { return customerName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemEntity> getItems() { return items; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
