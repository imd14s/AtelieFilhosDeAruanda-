package com.atelie.ecommerce.api.common.error;

import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.api.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void handleNotFound_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Resource not found"));
    }

    @Test
    void handleConflict_ShouldReturn409() throws Exception {
        mockMvc.perform(get("/test/conflict"))
                .andExpect(status().isConflict())
                .andExpect(content().string("Conflict occurred"));
    }

    @Test
    void handleDbConflict_ShouldReturn409() throws Exception {
        mockMvc.perform(get("/test/db-conflict"))
                .andExpect(status().isConflict())
                .andExpect(content().string("Conflito de dados: Recurso duplicado ou restrição violada."));
    }

    @Test
    void handleUnauthorized_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/test/unauthorized"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Unauthorized access"));
    }

    @Test
    void handleAccessDenied_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/test/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void handleIllegalArgument_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/test/illegal-argument"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid argument"));
    }

    @Test
    void handleIllegalState_ShouldReturn409() throws Exception { // GlobalExceptionHandler maps IllegalState to 409
        mockMvc.perform(get("/test/illegal-state"))
                .andExpect(status().isConflict())
                .andExpect(content().string("Invalid state"));
    }

    @RestController
    static class TestController {
        @GetMapping("/test/not-found")
        void notFound() {
            throw new NotFoundException("Resource not found");
        }

        @GetMapping("/test/conflict")
        void conflict() {
            throw new ConflictException("Conflict occurred");
        }

        @GetMapping("/test/db-conflict")
        void dbConflict() {
            throw new DataIntegrityViolationException("DB error");
        }

        @GetMapping("/test/unauthorized")
        void unauthorized() {
            throw new UnauthorizedException("Unauthorized access");
        }

        @GetMapping("/test/forbidden")
        void forbidden() {
            throw new AccessDeniedException("Access denied");
        }

        @GetMapping("/test/illegal-argument")
        void illegalArgument() {
            throw new IllegalArgumentException("Invalid argument");
        }

        @GetMapping("/test/illegal-state")
        void illegalState() {
            throw new IllegalStateException("Invalid state");
        }
    }
}
