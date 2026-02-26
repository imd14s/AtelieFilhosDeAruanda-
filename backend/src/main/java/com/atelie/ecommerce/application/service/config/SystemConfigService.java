package com.atelie.ecommerce.application.service.config;

import com.atelie.ecommerce.domain.config.SystemConfig;
import com.atelie.ecommerce.domain.config.SystemConfigGateway;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemConfigService {

    private final SystemConfigGateway gateway;

    public SystemConfigService(SystemConfigGateway gateway) {
        this.gateway = gateway;
    }

    public List<SystemConfig> listAll() {
        return gateway.findAll();
    }

    public Optional<SystemConfig> findByKey(String key) {
        return gateway.findByKey(key);
    }

    public void upsert(String key, String value) {
        SystemConfig config = new SystemConfig(key, value);
        gateway.save(config);
    }

    public void delete(String key) {
        gateway.deleteByKey(key);
    }
}
