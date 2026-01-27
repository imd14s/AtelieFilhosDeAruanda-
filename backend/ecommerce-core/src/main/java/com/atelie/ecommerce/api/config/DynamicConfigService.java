package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import com.atelie.ecommerce.domain.config.SystemConfigKey;
import com.atelie.ecommerce.api.config.exception.MissingConfigException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DynamicConfigService {

    private final SystemConfigGateway gateway;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public DynamicConfigService(SystemConfigGateway gateway) {
        this.gateway = gateway;
        refresh();
    }

    public void refresh() {
        cache.clear();
        for (SystemConfig c : gateway.findAll()) {
            cache.put(c.key(), c.value());
        }
    }

    public String requireString(SystemConfigKey key) {
        return get(key);
    }

    public BigDecimal requireBigDecimal(SystemConfigKey key) {
        try {
            return new BigDecimal(get(key));
        } catch (Exception e) {
            throw new IllegalStateException("Config inválida: " + key.name());
        }
    }

    public boolean requireBoolean(SystemConfigKey key) {
        return Boolean.parseBoolean(get(key));
    }

    private String get(SystemConfigKey key) {
        String value = cache.get(key.name());
        if (value == null) throw new MissingConfigException(key.name());
        return value;
    }
}
