package com.atelie.ecommerce.application.common.exception;

/**
 * NotFoundException.
 *
 * Use para cenários de recurso não encontrado (ex: categoria inexistente).
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
