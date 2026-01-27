package com.atelie.ecommerce.infrastructure.persistence.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
