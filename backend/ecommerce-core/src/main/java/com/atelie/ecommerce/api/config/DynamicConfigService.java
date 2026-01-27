package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.api.config.exception.MissingConfigException;
import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * DynamicConfigService.
 *
 * Serviço de aplicação para carregar configurações dinâmicas do banco (via gateway)
 * e disponibilizar acesso tipado (String/BigDecimal/long/boolean) com cache em memória.
 */
@Service
public class DynamicConfigService {

    private final SystemConfigGateway gateway;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public DynamicConfigService(SystemConfigGateway gateway) {
        this.gateway = gateway;
    }

    @Transactional(readOnly = true)
    public void refresh() {
        List<SystemConfig> configs = gateway.findAll();
        cache.clear();
        for (SystemConfig c : configs) {
            if (c.key() != null) {
                cache.put(c.key(), c.value());
            }
        }
    }

    public String requireString(String key) {
        String value = cache.get(key);
        if (value == null) throw new MissingConfigException(key);
        return value;
    }

    public BigDecimal requireBigDecimal(String key) {
        String v = requireString(key).trim();
        try {
            return new BigDecimal(v);
        } catch (Exception e) {
            throw new IllegalStateException("Config inválida (BigDecimal) para " + key + ": " + v);
        }
    }

    public long requireLong(String key) {
        String v = requireString(key).trim();
        try {
            return Long.parseLong(v);
        } catch (Exception e) {
            throw new IllegalStateException("Config inválida (long) para " + key + ": " + v);
        }
    }

    public boolean requireBoolean(String key) {
        String v = requireString(key).trim().toLowerCase();
        if ("true".equals(v) || "false".equals(v)) return Boolean.parseBoolean(v);
        throw new IllegalStateException("Config inválida (boolean) para " + key + ": " + v);
    }

    public boolean containsKey(String key) {
        return cache.containsKey(key);
    }
}
