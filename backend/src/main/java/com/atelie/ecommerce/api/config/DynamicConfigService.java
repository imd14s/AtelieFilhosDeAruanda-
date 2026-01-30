package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.api.config.exception.MissingConfigException;
import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DynamicConfigService {

    private static final Logger log = LoggerFactory.getLogger(DynamicConfigService.class);
    public static final String CACHE_TTL_SECONDS_KEY = "CACHE_TTL_SECONDS";
    private static final long DEFAULT_CACHE_TTL_SECONDS = 300;

    private final SystemConfigGateway gateway;
    private final Clock clock;
    
    // Cache final e thread-safe
    private final Map<String, String> cache = new ConcurrentHashMap<>();
    
    // Volatile para garantir visibilidade
    private volatile LocalDateTime lastUpdate = LocalDateTime.MIN;

    public DynamicConfigService(SystemConfigGateway gateway, Clock clock) {
        this.gateway = gateway;
        this.clock = clock;
    }

    // Método sincronizado para evitar múltiplas queries ao banco simultaneamente
    public synchronized void refresh() {
        log.info("DynamicConfigService: Recarregando configurações...");
        cache.clear();
        for (SystemConfig c : gateway.findAll()) {
            if (c != null && c.key() != null) {
                cache.put(c.key(), c.value());
            }
        }
        lastUpdate = LocalDateTime.now(clock);
        log.info("DynamicConfigService: cache atualizado. Total chaves={}", cache.size());
    }

    private void checkCacheExpiration() {
        if (isCacheExpired()) {
            synchronized (this) {
                if (isCacheExpired()) { // Double check
                    refresh();
                }
            }
        }
    }

    private boolean isCacheExpired() {
        if (lastUpdate.equals(LocalDateTime.MIN)) return true;
        long ttlSeconds = getLongInternal(CACHE_TTL_SECONDS_KEY, DEFAULT_CACHE_TTL_SECONDS);
        return LocalDateTime.now(clock).isAfter(lastUpdate.plusSeconds(ttlSeconds));
    }

    // Helper interno que não dispara refresh recursivo
    private long getLongInternal(String key, long defaultValue) {
        String val = cache.get(key);
        if (val == null) return defaultValue;
        try { return Long.parseLong(val); } catch (Exception e) { return defaultValue; }
    }

    // Métodos públicos
    public boolean containsKey(String key) {
        checkCacheExpiration();
        return cache.containsKey(key);
    }

    public String getString(String key) {
        checkCacheExpiration();
        return cache.get(key);
    }

    public String requireString(String key) {
        String value = getString(key);
        if (value == null) throw new MissingConfigException(key);
        return value;
    }

    public BigDecimal requireBigDecimal(String key) {
        String v = requireString(key);
        try { return new BigDecimal(v.trim()); } 
        catch (Exception e) { throw new IllegalStateException("Config inválida (BigDecimal) para " + key); }
    }

    public long getLong(String key, long defaultValue) {
        String v = getString(key);
        if (v == null) return defaultValue;
        try { return Long.parseLong(v.trim()); } 
        catch (Exception e) { throw new IllegalStateException("Config inválida (long) para " + key); }
    }

    public boolean requireBoolean(String key) {
        String v = getString(key);
        if (v == null) throw new MissingConfigException(key);
        return Boolean.parseBoolean(v.trim());
    }
}
