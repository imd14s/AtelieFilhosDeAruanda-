package com.atelie.ecommerce.domain.fiscal.nfe.integration;

public class SefazCommunicationException extends RuntimeException {
    public SefazCommunicationException(String message) {
        super(message);
    }

    public SefazCommunicationException(String message, Throwable cause) {
        super(message, cause);
    }
}
