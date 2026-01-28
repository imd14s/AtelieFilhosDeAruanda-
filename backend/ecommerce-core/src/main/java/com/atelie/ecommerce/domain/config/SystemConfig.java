package com.atelie.ecommerce.domain.config;

public class SystemConfig {

    private final String key;
    private final String value;

    public SystemConfig(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String key() {
        return key;
    }

    public String value() {
        return value;
    }
}
