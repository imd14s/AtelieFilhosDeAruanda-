package com.atelie.ecommerce.api.auth.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES (DDT/TDD) - Validação de DTOs AUTH
 *
 * Objetivo:
 * - Garantir que os DTOs de entrada rejeitam payloads inválidos.
 *
 * Nota:
 * - Estes testes não dependem de controller/service.
 */
class AuthDtoValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDownValidator() {
        factory.close();
    }

    @Test
    void registerRequestShouldBeValid() {
        RegisterRequest dto = new RegisterRequest("Everson Dias", "everson@example.com", "12345678");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty(), "Expected no violations for a valid RegisterRequest.");
    }

    @Test
    void registerRequestShouldRejectBlankName() {
        RegisterRequest dto = new RegisterRequest("   ", "everson@example.com", "12345678");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void registerRequestShouldRejectInvalidEmail() {
        RegisterRequest dto = new RegisterRequest("Everson Dias", "email-invalido", "12345678");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void registerRequestShouldRejectShortPassword() {
        RegisterRequest dto = new RegisterRequest("Everson Dias", "everson@example.com", "123");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void loginRequestShouldBeValid() {
        LoginRequest dto = new LoginRequest("everson@example.com", "12345678");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty(), "Expected no violations for a valid LoginRequest.");
    }

    @Test
    void loginRequestShouldRejectBlankEmail() {
        LoginRequest dto = new LoginRequest("   ", "12345678");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void loginRequestShouldRejectInvalidEmail() {
        LoginRequest dto = new LoginRequest("email-invalido", "12345678");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void loginRequestShouldRejectBlankPassword() {
        LoginRequest dto = new LoginRequest("everson@example.com", "   ");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }
}
