package com.atelie.ecommerce.application.service.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES (DDT/TDD) - AuthService
 *
 * Contrato:
 * - register(name,email,password) -> userId não vazio
 * - login(email,password) -> accessToken não vazio
 * - getGoogleAuthUrl() -> authUrl não vazio
 *
 * Nota DDT:
 * - Nesta fase, existe skeleton. Esperamos falha controlada por assert,
 *   pois o retorno deve ser "TODO" até implementarmos.
 */
class AuthServiceTest {

    @Test
    void shouldReturnUserIdWhenRegistering() {
        AuthService service = new AuthService();

        String userId = service.register("Everson Dias", "everson@example.com", "12345678");

        assertNotNull(userId);
        assertFalse(userId.isBlank());
        assertNotEquals("TODO", userId, "Skeleton deve falhar até implementação real.");
    }

    @Test
    void shouldReturnAccessTokenWhenLoggingIn() {
        AuthService service = new AuthService();

        String accessToken = service.login("everson@example.com", "12345678");

        assertNotNull(accessToken);
        assertFalse(accessToken.isBlank());
        assertNotEquals("TODO", accessToken, "Skeleton deve falhar até implementação real.");
    }

    @Test
    void shouldReturnGoogleAuthUrl() {
        AuthService service = new AuthService();

        String authUrl = service.getGoogleAuthUrl();

        assertNotNull(authUrl);
        assertFalse(authUrl.isBlank());
        assertNotEquals("TODO", authUrl, "Skeleton deve falhar até implementação real.");
    }
}
