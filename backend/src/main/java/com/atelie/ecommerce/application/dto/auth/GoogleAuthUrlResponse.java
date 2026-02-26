package com.atelie.ecommerce.application.dto.auth;

/**
 * DTO - GoogleAuthUrlResponse
 *
 * Contrato de saída do endpoint:
 * GET /auth/google/url
 */
public class GoogleAuthUrlResponse {

    private String authUrl;

    public GoogleAuthUrlResponse() {}

    public GoogleAuthUrlResponse(String authUrl) {
        this.authUrl = authUrl;
    }

    public String getAuthUrl() {
        return authUrl;
    }
}
