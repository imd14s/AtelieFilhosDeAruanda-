package com.atelie.ecommerce.application.service;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for service unit tests using Mockito.
 * Ensures fast execution without Spring context loading.
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Tag("unit")
public abstract class BaseServiceTest {
}
