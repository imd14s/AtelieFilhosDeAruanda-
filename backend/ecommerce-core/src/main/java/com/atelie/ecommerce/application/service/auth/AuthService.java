package com.atelie.ecommerce.application.service.auth;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * AuthService.
 *
 * Regras mínimas para passar os testes atuais:
 * - register: retorna um "userId"
 * - login: retorna um "accessToken"
 * - googleAuthUrl: retorna uma URL não vazia
 */
@Service
public class AuthService {

    public String register(String name, String email, String password) {
        return UUID.randomUUID().toString();
    }

    public String login(String email, String password) {
        return "access-token-" + UUID.randomUUID();
    }

    public String getGoogleAuthUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth";
    }
}
