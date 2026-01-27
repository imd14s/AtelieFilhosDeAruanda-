package com.atelie.ecommerce.api.auth.dto;

import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthResponseDtoTest {

    @Test
    void shouldCreateRegisterResponse() {
        UUID id = UUID.randomUUID();
        // O Record exige todos os argumentos: ID, Nome, Email
        RegisterResponse response = new RegisterResponse(id, "Test User", "test@email.com");
        
        // Em Records, não usamos "getId()", usamos apenas "id()"
        assertEquals(id, response.id());
        assertEquals("Test User", response.name());
        assertEquals("test@email.com", response.email());
    }

    @Test
    void shouldCreateLoginResponse() {
        // O Record exige: Token, Nome, Email
        LoginResponse response = new LoginResponse("token123", "Test User", "test@email.com");
        
        assertEquals("token123", response.token());
        assertEquals("Test User", response.name());
        assertEquals("test@email.com", response.email());
    }
}
