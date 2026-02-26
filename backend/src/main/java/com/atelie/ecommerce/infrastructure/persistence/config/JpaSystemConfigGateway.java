package com.atelie.ecommerce.infrastructure.persistence.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JpaSystemConfigGateway.
 *
 * Adapter de infraestrutura que lê configs via JPA e expõe para o domínio
 * através do SystemConfigGateway.
 */
@Repository
public class JpaSystemConfigGateway implements SystemConfigGateway {

    private final SystemConfigRepository repository;

    public JpaSystemConfigGateway(SystemConfigRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SystemConfig> findAll() {
        return repository.findAll().stream()
                .filter(e -> e.getConfigKey() != null)
                .map(e -> new SystemConfig(e.getConfigKey(), e.getConfigValue()))
                .toList();
    }

    @Override
    @Cacheable(value = "systemConfigs", key = "#key")
    public Optional<SystemConfig> findByKey(String key) {
        return repository.findById(key)
                .map(e -> new SystemConfig(e.getConfigKey(), e.getConfigValue()));
    }

    @Override
    @CacheEvict(value = "systemConfigs", key = "#config.key()")
    public void save(SystemConfig config) {
        SystemConfigEntity entity = SystemConfigEntity.builder()
                .configKey(config.key())
                .configValue(config.value())
                .build();
        repository.save(entity);
    }

    @Override
    @CacheEvict(value = "systemConfigs", key = "#key")
    public void deleteByKey(String key) {
        repository.deleteById(key);
    }
}
