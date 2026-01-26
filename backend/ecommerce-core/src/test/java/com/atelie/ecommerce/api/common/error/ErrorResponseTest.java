package com.atelie.ecommerce.api.common.error;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ErrorResponseTest.
 */
class ErrorResponseTest {

    @Test
    void shouldExposeAllFields() {
        ErrorResponse response = new ErrorResponse(
                404,
                "Not Found",
                "Route not found",
                "/x",
                null
        );

        assertEquals(404, response.getStatus());
        assertEquals("Not Found", response.getError());
        assertEquals("Route not found", response.getMessage());
        assertEquals("/x", response.getPath());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void shouldAllowNullFieldsInSkeletonPhase() {
        ErrorResponse response = ErrorResponse.badRequest("Validation error", "/x", null);

        assertEquals(400, response.getStatus());
        assertNotNull(response.getTimestamp());
        assertNull(response.getFields());
    }

    @Test
    void shouldAcceptFieldsMapWhenProvided() {
        ErrorResponse response = ErrorResponse.badRequest("Validation error", "/x", Map.of("email", "must not be blank"));

        assertEquals(400, response.getStatus());
        assertEquals("must not be blank", response.getFields().get("email"));
    }
}
