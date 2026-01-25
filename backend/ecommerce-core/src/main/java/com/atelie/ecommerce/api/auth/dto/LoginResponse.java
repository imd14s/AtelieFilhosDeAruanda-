package com.atelie.ecommerce.api.auth.dto;

/**
 * DTO - LoginResponse
 *
 * Contrato de saída do endpoint:
 * POST /auth/login
 */
public class LoginResponse {

    private String accessToken;

    public LoginResponse() {}

    public LoginResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }
}
