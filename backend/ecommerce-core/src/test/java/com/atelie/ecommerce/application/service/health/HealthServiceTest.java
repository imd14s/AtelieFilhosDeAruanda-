package com.atelie.ecommerce.application.service.health;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES (DDT/TDD) - HealthService
 *
 * Contrato:
 * - getStatus() deve retornar exatamente "OK"
 * - não deve retornar null
 * - chamadas repetidas devem retornar o mesmo resultado (idempotente)
 *
 * Nota DDT:
 * - Este teste falhará na compilação enquanto o HealthService não existir.
 * - Isso é esperado nesta fase (teste antes da implementação).
 */
class HealthServiceTest {

    @Test
    void shouldReturnOkStatus() {
        HealthService service = new HealthService();
        String status = service.getStatus();

        assertNotNull(status);
        assertEquals("OK", status);
    }

    @Test
    void shouldReturnSameStatusWhenCalledManyTimes() {
        HealthService service = new HealthService();

        String first = service.getStatus();
        String second = service.getStatus();
        String third = service.getStatus();

        assertEquals("OK", first);
        assertEquals(first, second);
        assertEquals(second, third);
    }

    @Test
    void shouldNotThrowWhenGettingStatus() {
        HealthService service = new HealthService();

        assertDoesNotThrow(service::getStatus);
    }
}
