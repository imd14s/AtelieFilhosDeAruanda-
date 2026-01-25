package com.atelie.ecommerce.api.common.error;

import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES - Contrato do ErrorResponse
 *
 * Objetivo:
 * - Garantir que o DTO de erro contém campos mínimos esperados.
 */
class ErrorResponseTest {

    @Test
    void shouldExposeAllFields() {
        OffsetDateTime now = OffsetDateTime.now();

        ErrorResponse response = new ErrorResponse(
                now,
                400,
                "AUTH_INVALID_REQUEST",
                "Invalid request payload",
                "/auth/register"
        );

        assertNotNull(response.getTimestamp());
        assertEquals(now, response.getTimestamp());

        assertEquals(400, response.getStatus());
        assertEquals("AUTH_INVALID_REQUEST", response.getCode());
        assertEquals("Invalid request payload", response.getMessage());
        assertEquals("/auth/register", response.getPath());
    }

    @Test
    void shouldAllowNullFieldsInSkeletonPhase() {
        ErrorResponse response = new ErrorResponse();

        // Nesta fase, só garantimos que o objeto existe e getters não explodem.
        assertDoesNotThrow(response::getTimestamp);
        assertDoesNotThrow(response::getStatus);
        assertDoesNotThrow(response::getCode);
        assertDoesNotThrow(response::getMessage);
        assertDoesNotThrow(response::getPath);
    }
}
