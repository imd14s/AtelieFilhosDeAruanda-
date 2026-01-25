package com.atelie.ecommerce.api.auth.dto;

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
