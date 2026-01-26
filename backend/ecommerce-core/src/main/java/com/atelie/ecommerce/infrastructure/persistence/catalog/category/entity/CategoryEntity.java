package com.atelie.ecommerce.infrastructure.persistence.catalog.category.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "categories")
public class CategoryEntity {

  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private UUID id;

  @Column(name = "name", nullable = false, unique = true, length = 120)
  private String name;

  @Column(name = "active", nullable = false)
  private Boolean active;

  public CategoryEntity() {}

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public Boolean getActive() { return active; }
  public void setActive(Boolean active) { this.active = active; }
}
