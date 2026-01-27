package com.atelie.ecommerce.api.auth.dto;

public record LoginResponse(
    String token,
    String name,
    String email
) {}
