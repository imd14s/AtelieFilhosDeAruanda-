package com.atelie.ecommerce.application.common.exception;

/**
 * UnauthorizedException.
 *
 * Use para cenários de autenticação/autorização inválida.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
