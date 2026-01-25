package com.atelie.ecommerce.api.auth.dto;

/**
 * DTO - RegisterResponse
 *
 * Contrato de saída do endpoint:
 * POST /auth/register
 */
public class RegisterResponse {

    private String userId;

    public RegisterResponse() {}

    public RegisterResponse(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}
