package com.atelie.ecommerce.api.auth.dto;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class AuthResponseDtoTest {
    @Test
    void shouldCreateLoginResponse() {
        LoginResponse response = new LoginResponse("token-123", "User Test", "test@test.com");
        
        Assertions.assertEquals("token-123", response.getToken());
        Assertions.assertEquals("User Test", response.getName());
        Assertions.assertEquals("test@test.com", response.getEmail());
    }
}
