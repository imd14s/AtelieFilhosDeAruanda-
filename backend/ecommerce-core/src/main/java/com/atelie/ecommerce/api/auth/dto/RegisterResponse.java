package com.atelie.ecommerce.api.auth.dto;

import java.util.UUID;

public record RegisterResponse(
    UUID id,
    String name,
    String email
) {}
