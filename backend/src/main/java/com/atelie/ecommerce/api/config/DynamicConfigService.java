package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DynamicConfigService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DynamicConfigService.class);

    public static final String CACHE_TTL_SECONDS_KEY = "CACHE_TTL_SECONDS";

    private final SystemConfigRepository repository;
    private final Environment environment;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public DynamicConfigService(SystemConfigRepository repository, Environment environment) {
        this.repository = repository;
        this.environment = environment;
        refresh();
    }

    public void refresh() {
        try {
            var configs = repository.findAll();
            cache.clear();
            configs.forEach(c -> cache.put(c.getConfigKey(), c.getConfigValue()));
            log.info("Cache de configurações atualizado: {} itens", cache.size());
        } catch (Exception e) {
            log.warn("Não foi possível carregar configurações do banco: {}",
                    e.getMessage());
        }
    }

    @EventListener
    public void onEntityChanged(EntityChangedEvent event) {
        if ("SYSTEM_CONFIG".equals(event.getEntityType()))
            refresh();
    }

    public String getString(String key) {
        String val = cache.get(key);
        if (val == null) {
            // Fallback: buscar nas variáveis de ambiente do Spring
            val = environment.getProperty(key);
        }
        return val;
    }

    public String requireString(String key) {
        String v = getString(key);
        if (v == null) {
            // Última tentativa: recarregar do banco
            refresh();
            v = getString(key);
        }
        if (v == null)
            throw new IllegalStateException("Config ausente (banco e ENV): " + key);
        return v;
    }

    public boolean requireBoolean(String key) {
        return Boolean.parseBoolean(requireString(key));
    }

    public boolean containsKey(String key) {
        return cache.containsKey(key) || environment.containsProperty(key);
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
