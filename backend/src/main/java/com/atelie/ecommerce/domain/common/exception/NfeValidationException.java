package com.atelie.ecommerce.domain.common.exception;

public class NfeValidationException extends RuntimeException {

    public NfeValidationException(String message) {
        super(message);
    }

    public NfeValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
