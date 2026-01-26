package com.atelie.ecommerce.api.catalog.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCategoryRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "active is required")
    private Boolean active;

    public CreateCategoryRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
