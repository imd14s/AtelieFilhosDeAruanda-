package com.atelie.ecommerce.domain.catalog.product;

import lombok.Getter;

@Getter
public enum ProductionType {
    PROPRIA("Fabricação Própria"),
    REVENDA("Revenda");

    private final String description;

    ProductionType(String description) {
        this.description = description;
    }
}
