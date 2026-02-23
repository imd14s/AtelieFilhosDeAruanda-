package com.atelie.ecommerce.infrastructure.persistence.order;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    private UUID id;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_email")
    private String customerEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity user;

    private String status;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    // Campos exigidos pelo código legado
    private String source; // Ex: "SITE", "MERCADO_LIVRE"

    @Column(name = "external_id")
    private String externalId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    @Column(name = "created_at")
    private Instant createdAt; // Corrigido de LocalDateTime para Instant

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "shipping_street")
    private String shippingStreet;

    @Column(name = "shipping_number")
    private String shippingNumber;

    @Column(name = "shipping_complement")
    private String shippingComplement;

    @Column(name = "shipping_neighborhood")
    private String shippingNeighborhood;

    @Column(name = "shipping_city")
    private String shippingCity;

    @Column(name = "shipping_state", length = 2)
    private String shippingState;

    @Column(name = "shipping_zip_code", length = 10)
    private String shippingZipCode;

    @Column(name = "shipping_cost")
    private BigDecimal shippingCost;

    @Column(name = "shipping_provider")
    private String shippingProvider;

    public OrderEntity() {
    }

    // Getters e Setters Completos
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity getUser() {
        return user;
    }

    public void setUser(com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity user) {
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public List<OrderItemEntity> getItems() {
        return items;
    }

    public void setItems(List<OrderItemEntity> items) {
        this.items = items;
        if (items != null) {
            items.forEach(item -> item.setOrder(this));
        }
    }

    public void addItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getShippingStreet() {
        return shippingStreet;
    }

    public void setShippingStreet(String shippingStreet) {
        this.shippingStreet = shippingStreet;
    }

    public String getShippingNumber() {
        return shippingNumber;
    }

    public void setShippingNumber(String shippingNumber) {
        this.shippingNumber = shippingNumber;
    }

    public String getShippingComplement() {
        return shippingComplement;
    }

    public void setShippingComplement(String shippingComplement) {
        this.shippingComplement = shippingComplement;
    }

    public String getShippingNeighborhood() {
        return shippingNeighborhood;
    }

    public void setShippingNeighborhood(String shippingNeighborhood) {
        this.shippingNeighborhood = shippingNeighborhood;
    }

    public String getShippingCity() {
        return shippingCity;
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = shippingCity;
    }

    public String getShippingState() {
        return shippingState;
    }

    public void setShippingState(String shippingState) {
        this.shippingState = shippingState;
    }

    public String getShippingZipCode() {
        return shippingZipCode;
    }

    public void setShippingZipCode(String shippingZipCode) {
        this.shippingZipCode = shippingZipCode;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public String getShippingProvider() {
        return shippingProvider;
    }

    public void setShippingProvider(String shippingProvider) {
        this.shippingProvider = shippingProvider;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
