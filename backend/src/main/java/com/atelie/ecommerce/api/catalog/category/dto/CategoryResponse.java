package com.atelie.ecommerce.api.catalog.category.dto;

import java.util.UUID;

public class CategoryResponse {

    private UUID id;
    private String name;
    private Boolean active;

    public CategoryResponse(UUID id, String name, Boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public Boolean getActive() { return active; }
}
