package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DynamicConfigService {

    public static final String CACHE_TTL_SECONDS_KEY = "CACHE_TTL_SECONDS";
    private final SystemConfigRepository repository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public DynamicConfigService(SystemConfigRepository repository) {
        this.repository = repository;
        refresh();
    }

    @EventListener
    public void handleEntityChanged(EntityChangedEvent event) {
        log.info("Evento de mudança detectado: {}. Atualizando cache de configurações...", event.getEntityType());
        refresh();
    }

    public synchronized void refresh() {
        cache.clear();
        cache.putAll(repository.findAll().stream()
                .collect(Collectors.toMap(SystemConfigEntity::getConfigKey, SystemConfigEntity::getConfigValue)));
    }

    public String getString(String key) { return cache.get(key); }
    public String getString(String key, String defaultValue) { return cache.getOrDefault(key, defaultValue); }
    public long getLong(String key, long defaultValue) {
        try {
            String val = cache.get(key);
            return val != null ? Long.parseLong(val) : defaultValue;
        } catch (NumberFormatException e) { return defaultValue; }
    }
}
