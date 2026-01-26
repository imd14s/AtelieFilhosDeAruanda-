package com.atelie.ecommerce.api.auth;

import com.atelie.ecommerce.application.service.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController.
 *
 * Endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - GET  /auth/google/url
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@RequestBody Map<String, String> body) {
        String userId = authService.register(
                body.get("name"),
                body.get("email"),
                body.get("password")
        );
        return Map.of("userId", userId);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String accessToken = authService.login(
                body.get("email"),
                body.get("password")
        );
        return Map.of("accessToken", accessToken);
    }

    @GetMapping("/google/url")
    public Map<String, String> googleUrl() {
        return Map.of("authUrl", authService.getGoogleAuthUrl());
    }
}
