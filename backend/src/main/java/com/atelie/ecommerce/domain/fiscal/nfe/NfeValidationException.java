package com.atelie.ecommerce.domain.fiscal.nfe;

public class NfeValidationException extends RuntimeException {

    public NfeValidationException(String message) {
        super(message);
    }

    public NfeValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
