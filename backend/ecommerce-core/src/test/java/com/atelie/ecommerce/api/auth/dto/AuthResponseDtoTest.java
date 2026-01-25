package com.atelie.ecommerce.api.auth.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES - DTOs de resposta AUTH
 *
 * Objetivo:
 * - Garantir que os contratos de saída possuem dados válidos.
 */
class AuthResponseDtoTest {

    @Test
    void registerResponseShouldExposeUserId() {
        RegisterResponse response = new RegisterResponse("user-123");

        assertNotNull(response.getUserId());
        assertEquals("user-123", response.getUserId());
    }

    @Test
    void loginResponseShouldExposeAccessToken() {
        LoginResponse response = new LoginResponse("token-abc");

        assertNotNull(response.getAccessToken());
        assertEquals("token-abc", response.getAccessToken());
    }

    @Test
    void googleAuthUrlResponseShouldExposeAuthUrl() {
        GoogleAuthUrlResponse response = new GoogleAuthUrlResponse("https://accounts.google.com");

        assertNotNull(response.getAuthUrl());
        assertTrue(response.getAuthUrl().startsWith("http"));
    }
}
