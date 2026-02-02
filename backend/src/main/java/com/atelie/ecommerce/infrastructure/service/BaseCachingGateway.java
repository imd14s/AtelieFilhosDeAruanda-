package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Classe base para Gateways que precisam de cache com TTL.
 * Centraliza a lógica de expiração e limpeza[cite: 775, 828, 842].
 */
public abstract class BaseCachingGateway {

    protected final DynamicConfigService configService;
    protected final Clock clock;
    protected LocalDateTime lastUpdate = LocalDateTime.MIN;
    protected final Map<String, Object> genericCache = new ConcurrentHashMap<>();

    protected BaseCachingGateway(DynamicConfigService configService, Clock clock) {
        this.configService = configService;
        this.clock = clock;
    }

    protected long getTtlSeconds() {
        return configService.getLong(DynamicConfigService.CACHE_TTL_SECONDS_KEY, 300);
    }

    protected void checkCache() {
        if (lastUpdate.equals(LocalDateTime.MIN)) return;
        if (LocalDateTime.now(clock).isAfter(lastUpdate.plusSeconds(getTtlSeconds()))) {
            refresh();
        }
    }

    public synchronized void refresh() {
        genericCache.clear();
        lastUpdate = LocalDateTime.now(clock);
    }
    
    protected void markAsInitialized() {
        if (lastUpdate.equals(LocalDateTime.MIN)) {
            lastUpdate = LocalDateTime.now(clock);
        }
    }
}
