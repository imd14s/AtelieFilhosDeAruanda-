package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ConfigBootstrap implements ApplicationRunner {

    private final DynamicConfigService dynamicConfigService;

    public ConfigBootstrap(DynamicConfigService dynamicConfigService) {
        this.dynamicConfigService = dynamicConfigService;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Cache inicial do motor dinâmico
        dynamicConfigService.refresh();
    }
}
