package com.atelie.ecommerce.domain.config;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SystemConfig {

    private final String key;
    private final String value;

    public SystemConfig(String key, String value) {
        this.key = key;
        this.value = value;
    }

    @JsonProperty("configKey")
    public String key() {
        return key;
    }

    @JsonProperty("configValue")
    public String value() {
        return value;
    }
}
