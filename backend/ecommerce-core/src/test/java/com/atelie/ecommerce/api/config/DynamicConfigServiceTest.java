package com.atelie.ecommerce.api.config;

import com.atelie.ecommerce.TestProfileConfig;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;
import com.atelie.ecommerce.testsupport.SystemConfigTestHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DynamicConfigServiceTest extends TestProfileConfig {

    @Autowired
    DynamicConfigService service;

    @Autowired
    SystemConfigRepository repo;

    @Test
    void refreshLoadsValuesFromDb() {
        SystemConfigTestHelper.upsert(repo, "TEST_KEY", "123");

        service.refresh();

        assertEquals("123", service.requireString("TEST_KEY"));
    }
}
