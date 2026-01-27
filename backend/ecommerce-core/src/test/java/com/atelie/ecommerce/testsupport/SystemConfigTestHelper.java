package com.atelie.ecommerce.testsupport;

import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.config.SystemConfigRepository;

public final class SystemConfigTestHelper {

    private SystemConfigTestHelper() {}

    public static void upsert(SystemConfigRepository repo, String key, String value) {
        SystemConfigEntity c = repo.findById(key).orElseGet(SystemConfigEntity::new);
        c.setConfigKey(key);
        c.setConfigValue(value);
        repo.save(c);
    }
}
