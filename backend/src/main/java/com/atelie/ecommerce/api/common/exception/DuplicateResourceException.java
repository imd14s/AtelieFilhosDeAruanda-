package com.atelie.ecommerce.api.common.exception;

/**
 * Exception para recursos duplicados.
 * 
 * Usado quando se tenta criar um recurso que já existe (ex: categoria com mesmo
 * nome/slug).
 * Retorna HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
