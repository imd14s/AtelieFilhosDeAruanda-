package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import org.springframework.context.event.EventListener;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public abstract class BaseCachingGateway {
    protected final DynamicConfigService configService;
    protected final Clock clock;
    protected LocalDateTime lastUpdate = LocalDateTime.MIN;
    protected final Map<String, Object> genericCache = new ConcurrentHashMap<>();

    protected BaseCachingGateway(DynamicConfigService configService, Clock clock) {
        this.configService = configService;
        this.clock = clock;
    }

    @EventListener
    public void handleEntityChanged(EntityChangedEvent event) {
        refresh();
    }

    protected void checkCache() {
        if (lastUpdate.equals(LocalDateTime.MIN)) {
            lastUpdate = LocalDateTime.now(clock);
            return;
        }
        if (LocalDateTime.now(clock).isAfter(lastUpdate.plusSeconds(configService.getLong("CACHE_TTL_SECONDS", 300)))) {
            refresh();
        }
    }

    public synchronized void refresh() {
        genericCache.clear();
        lastUpdate = LocalDateTime.now(clock);
    }
}
