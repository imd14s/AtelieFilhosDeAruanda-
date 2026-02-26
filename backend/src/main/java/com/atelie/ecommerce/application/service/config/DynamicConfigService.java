package com.atelie.ecommerce.application.service.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class DynamicConfigService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DynamicConfigService.class);

    public static final String CACHE_TTL_SECONDS_KEY = "CACHE_TTL_SECONDS";

    private final SystemConfigGateway gateway;
    private final Environment environment;

    public DynamicConfigService(SystemConfigGateway gateway, Environment environment) {
        this.gateway = gateway;
        this.environment = environment;
    }

    public String getString(String key) {
        String val = gateway.findByKey(key)
                .map(SystemConfig::value)
                .orElse(null);

        if (val == null) {
            // Fallback: buscar nas variáveis de ambiente do Spring
            val = environment.getProperty(key);
        }
        return val;
    }

    public String requireString(String key) {
        String v = getString(key);
        if (v == null)
            throw new IllegalStateException("Config ausente (banco e ENV): " + key);
        return v;
    }

    public boolean requireBoolean(String key) {
        return Boolean.parseBoolean(requireString(key));
    }

    public boolean containsKey(String key) {
        return gateway.findByKey(key).isPresent() || environment.containsProperty(key);
    }

    public void refresh() {
        // No-op: Spring Cache lida com a invalidação automaticamente via @CacheEvict
        log.debug("A atualização manual de configurações não é mais necessária (Spring Cache ativo).");
    }

    public String get(String key, String defaultValue) {
        String val = getString(key);
        return val != null ? val : defaultValue;
    }

    public long getLong(String key, int defaultValue) {
        String val = getString(key);
        if (val == null)
            return defaultValue;
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
