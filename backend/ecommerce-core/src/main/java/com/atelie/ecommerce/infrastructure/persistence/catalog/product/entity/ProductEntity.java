package com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity;

import com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity.CategoryEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products")
public class ProductEntity {

  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private UUID id;

  @Column(name = "name", nullable = false, length = 160)
  private String name;

  @Column(name = "description", nullable = false, length = 2000)
  private String description;

  @Column(name = "price", nullable = false, precision = 19, scale = 2)
  private BigDecimal price;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id", nullable = false)
  private CategoryEntity category;

  @Column(name = "active", nullable = false)
  private Boolean active;

  public ProductEntity() {}

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }

  public BigDecimal getPrice() { return price; }
  public void setPrice(BigDecimal price) { this.price = price; }

  public CategoryEntity getCategory() { return category; }
  public void setCategory(CategoryEntity category) { this.category = category; }

  public Boolean getActive() { return active; }
  public void setActive(Boolean active) { this.active = active; }
}
