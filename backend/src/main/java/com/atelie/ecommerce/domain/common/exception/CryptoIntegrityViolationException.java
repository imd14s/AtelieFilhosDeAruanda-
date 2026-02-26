package com.atelie.ecommerce.domain.common.exception;

public class CryptoIntegrityViolationException extends RuntimeException {
    public CryptoIntegrityViolationException(String message) {
        super(message);
    }

    public CryptoIntegrityViolationException(String message, Throwable cause) {
        super(message, cause);
    }
}
