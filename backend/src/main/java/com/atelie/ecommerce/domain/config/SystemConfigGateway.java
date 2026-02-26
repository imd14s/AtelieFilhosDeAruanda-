package com.atelie.ecommerce.domain.config;

import java.util.List;
import java.util.Optional;

public interface SystemConfigGateway {

    List<SystemConfig> findAll();

    java.util.Optional<SystemConfig> findByKey(String key);

    void save(SystemConfig config);

    void deleteByKey(String key);
}
