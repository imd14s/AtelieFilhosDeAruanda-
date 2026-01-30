package com.atelie.ecommerce.api.serviceengine.util;

import java.math.BigDecimal;
import java.util.Map;

public final class DriverConfigReader {

    private DriverConfigReader() {}

    public static BigDecimal requireBigDecimal(Map<String, Object> config, String key) {
        Object v = config.get(key);
        if (v == null) {
            throw new IllegalArgumentException("Config obrigatória ausente: '" + key + "'");
        }
        try {
            return new BigDecimal(String.valueOf(v));
        } catch (Exception e) {
            throw new IllegalArgumentException("Config inválida para '" + key + "': valor='" + v + "'");
        }
    }

    public static String optionalString(Map<String, Object> config, String key, String defaultValue) {
        Object v = config.get(key);
        if (v == null) return defaultValue;
        String s = String.valueOf(v);
        return s == null ? defaultValue : s;
    }

    public static String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Campo obrigatório ausente: '" + fieldName + "'");
        }
        return value;
    }

    public static BigDecimal requireMoney(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException("Campo obrigatório ausente: '" + fieldName + "'");
        }
        if (value instanceof BigDecimal bd) return bd;
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (Exception e) {
            throw new IllegalArgumentException("Campo inválido '" + fieldName + "': valor='" + value + "'");
        }
    }
}
