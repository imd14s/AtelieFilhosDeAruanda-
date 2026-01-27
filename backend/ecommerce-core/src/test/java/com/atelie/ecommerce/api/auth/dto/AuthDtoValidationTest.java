package com.atelie.ecommerce.api.auth.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthDtoValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private RegisterRequest buildRegister(String name, String email, String password) {
        RegisterRequest r = new RegisterRequest();
        r.setName(name);
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    @Test
    void shouldValidateRegisterRequest_whenValid() {
        RegisterRequest req = buildRegister("User", "user@email.com", "123456");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailValidation_whenNameIsBlank() {
        RegisterRequest req = buildRegister("", "user@email.com", "123456");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailValidation_whenEmailIsInvalid() {
        RegisterRequest req = buildRegister("User", "invalid", "123456");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailValidation_whenPasswordIsBlank() {
        RegisterRequest req = buildRegister("User", "user@email.com", "");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }
}
