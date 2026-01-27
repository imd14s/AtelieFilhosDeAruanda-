package com.atelie.ecommerce.infrastructure.persistence.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaSystemConfigGateway implements SystemConfigGateway {

    private final SystemConfigRepository repository;

    public JpaSystemConfigGateway(SystemConfigRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SystemConfig> findAll() {
        return repository.findAll()
                .stream()
                .map(e -> new SystemConfig(
                        e.getConfigKey(),
                        e.getConfigValue()
                ))
                .toList();
    }
}
