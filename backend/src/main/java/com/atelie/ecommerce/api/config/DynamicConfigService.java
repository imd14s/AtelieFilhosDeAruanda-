package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DynamicConfigService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DynamicConfigService.class);

    public static final String CACHE_TTL_SECONDS_KEY = "CACHE_TTL_SECONDS";

    private final SystemConfigRepository repository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public DynamicConfigService(SystemConfigRepository repository) {
        this.repository = repository;
        refresh();
    }

    public void refresh() {
        try {
            var configs = repository.findAll();
            cache.clear();
            configs.forEach(c -> cache.put(c.getConfigKey(), c.getConfigValue()));
            log.info("Cache de configurações atualizado: {} itens", cache.size());
        } catch (Exception e) {
            log.warn("Não foi possível carregar configurações iniciais (pode ser a primeira execução): {}",
                    e.getMessage());
        }
    }

    @EventListener
    public void onEntityChanged(EntityChangedEvent event) {
        if ("SYSTEM_CONFIG".equals(event.getEntityType()))
            refresh();
    }

    public String getString(String key) {
        return cache.get(key);
    }

    public String requireString(String key) {
        String v = getString(key);
        if (v == null)
            throw new IllegalStateException("Config ausente: " + key);
        return v;
    }

    public boolean requireBoolean(String key) {
        return Boolean.parseBoolean(requireString(key));
    }

    public boolean containsKey(String key) {
        return cache.containsKey(key);
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
