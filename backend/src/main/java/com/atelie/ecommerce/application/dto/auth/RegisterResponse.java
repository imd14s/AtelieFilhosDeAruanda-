package com.atelie.ecommerce.application.dto.auth;

import java.util.UUID;

public record RegisterResponse(
    UUID id,
    String name,
    String email
) {}
