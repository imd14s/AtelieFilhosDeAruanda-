package com.atelie.ecommerce.infrastructure.persistence.order;

import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Data
public class OrderItemEntity {

    @Id
    private UUID id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    // --- CORREÇÃO CRÍTICA: Mapeamento da Variante ---
    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = true) // Nullable para suportar legado
    private ProductVariantEntity variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
}
