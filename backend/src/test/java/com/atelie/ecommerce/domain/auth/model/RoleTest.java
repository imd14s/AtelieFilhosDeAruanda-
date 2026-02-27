package com.atelie.ecommerce.domain.auth.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class RoleTest {

    @Test
    void toSpringRole_ShouldReturnFormattedRole() {
        assertEquals("ROLE_ADMIN", Role.ADMIN.toSpringRole());
        assertEquals("ROLE_EMPLOYEE", Role.EMPLOYEE.toSpringRole());
        assertEquals("ROLE_CUSTOMER", Role.CUSTOMER.toSpringRole());
    }
}
