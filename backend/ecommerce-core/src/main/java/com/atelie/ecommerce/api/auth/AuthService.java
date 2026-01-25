package com.atelie.ecommerce.application.service.auth;

/**
 * Skeleton do AuthService.
 *
 * Objetivo:
 * - Existir para permitir que os testes compilem e rodem.
 * - Retorna valores placeholder ("TODO") para falha controlada por assert.
 */
public class AuthService {

    /**
     * Registra um usuário e retorna seu ID.
     *
     * @param name nome do usuário
     * @param email email do usuário
     * @param password senha do usuário
     * @return id do usuário (placeholder no skeleton)
     */
    public String register(String name, String email, String password) {
        return "TODO";
    }

    /**
     * Realiza login e retorna o access token.
     *
     * @param email email do usuário
     * @param password senha do usuário
     * @return token de acesso (placeholder no skeleton)
     */
    public String login(String email, String password) {
        return "TODO";
    }

    /**
     * Retorna a URL de autenticação do Google OAuth.
     *
     * @return auth URL (placeholder no skeleton)
     */
    public String getGoogleAuthUrl() {
        return "TODO";
    }
}
