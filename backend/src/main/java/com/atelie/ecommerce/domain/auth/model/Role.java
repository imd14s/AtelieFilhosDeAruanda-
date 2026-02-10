package com.atelie.ecommerce.domain.auth.model;

public enum Role {
    ADMIN,
    EMPLOYEE,
    CUSTOMER;

    public String toSpringRole() {
        return "ROLE_" + this.name();
    }
}
