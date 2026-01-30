package com.atelie.ecommerce.api.config.exception;

public class MissingConfigException extends RuntimeException {
    public MissingConfigException(String key) {
        super("Config obrigatória ausente no banco: " + key);
    }
}
