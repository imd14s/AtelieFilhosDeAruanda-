package com.atelie.ecommerce.infrastructure.persistence.order;

import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItemEntity implements com.atelie.ecommerce.domain.order.model.OrderItemModel {

    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private OrderEntity order;

    // Relacionamento real com Produto (não apenas ID)
    @ManyToOne
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    // Relacionamento com Variante (SKU)
    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariantEntity variant;

    @Column(name = "product_name")
    private String productName;

    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Override
    public String getProductNcm() {
        return product != null ? product.getNcm() : null;
    }

    @Override
    public Integer getProductOrigin() {
        return (product != null && product.getOrigin() != null) ? product.getOrigin().ordinal() : 0;
    }

    public OrderItemEntity() {
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public ProductVariantEntity getVariant() {
        return variant;
    }

    public void setVariant(ProductVariantEntity variant) {
        this.variant = variant;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
