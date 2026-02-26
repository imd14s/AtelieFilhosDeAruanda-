package com.atelie.ecommerce.domain.fiscal.nfe.security;

public class NfeSignatureException extends RuntimeException {
    public NfeSignatureException(String message) {
        super(message);
    }

    public NfeSignatureException(String message, Throwable cause) {
        super(message, cause);
    }
}
