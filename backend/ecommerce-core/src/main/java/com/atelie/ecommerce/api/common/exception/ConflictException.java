package com.atelie.ecommerce.api.common.exception;

/**
 * ConflictException.
 *
 * Use para cenários de conflito (ex: e-mail já cadastrado).
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
