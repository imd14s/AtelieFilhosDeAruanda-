package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.api.config.exception.MissingConfigException;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import com.atelie.ecommerce.domain.config.SystemConfig;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DynamicConfigService {

    private final SystemConfigGateway gateway;
    private final Map<String, String> cache = new ConcurrentHashMap<>();
    
    // Controle de TTL (Time To Live)
    private LocalDateTime lastUpdate = LocalDateTime.MIN;
    private static final long CACHE_TTL_MINUTES = 5;

    public DynamicConfigService(SystemConfigGateway gateway) {
        this.gateway = gateway;
    }

    public void refresh() {
        cache.clear();
        for (SystemConfig c : gateway.findAll()) {
            if (c != null && c.key() != null) {
                cache.put(c.key(), c.value());
            }
        }
        lastUpdate = LocalDateTime.now();
        System.out.println("DynamicConfigService: Cache atualizado. Total chaves: " + cache.size());
    }

    private void checkCacheExpiration() {
        if (LocalDateTime.now().isAfter(lastUpdate.plusMinutes(CACHE_TTL_MINUTES))) {
            refresh();
        }
    }

    public String requireString(String key) {
        checkCacheExpiration(); // Verifica se precisa recarregar antes de ler
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
        checkCacheExpiration();
        return cache.containsKey(key);
    }
}
