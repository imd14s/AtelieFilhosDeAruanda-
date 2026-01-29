package com.atelie.ecommerce.infrastructure.persistence.product;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    @Column(name="category_id", nullable=false)
    private UUID categoryId; 
    private String imageUrl; // Campo que faltava para o ProductImageController
    private Boolean active;
    private Boolean alertEnabled;
    private Long viewCount;

    @PrePersist
    public void prePersist() {
        if (this.active == null) this.active = true;
        if (this.alertEnabled == null) this.alertEnabled = true;
        if (this.viewCount == null) this.viewCount = 0L;
    }
}
