package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ServiceEngineWiringTest {

    private final ServiceEngine engine;
    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceProviderConfigJpaRepository configRepo;
    private final ServiceRoutingRuleJpaRepository ruleRepo;

    ServiceEngineWiringTest(ServiceEngine engine,
                            ServiceProviderJpaRepository providerRepo,
                            ServiceProviderConfigJpaRepository configRepo,
                            ServiceRoutingRuleJpaRepository ruleRepo) {
        this.engine = engine;
        this.providerRepo = providerRepo;
        this.configRepo = configRepo;
        this.ruleRepo = ruleRepo;
    }

    @BeforeEach
    void seedDb() {
        ruleRepo.deleteAll();
        configRepo.deleteAll();
        providerRepo.deleteAll();

        ServiceProviderEntity p = new ServiceProviderEntity();
        p.setId(UUID.randomUUID());
        p.setServiceType("SHIPPING");
        p.setCode("J3");
        p.setDriverKey("shipping.j3");
        p.setName("J3 Transportadora");
        p.setEnabled(true);
        p.setHealthEnabled(false);
        p.setPriority(1);
        providerRepo.save(p);

        ServiceProviderConfigEntity cfg = new ServiceProviderConfigEntity();
        cfg.setId(UUID.randomUUID());
        cfg.setProviderCode("J3");
        cfg.setEnvironment("prod");
        cfg.setSecretsRef(null);
        cfg.setConfigJson("{\"rate\": 13.00}");
        cfg.setVersion(1);
        configRepo.save(cfg);
    }

    @Test
    void shouldExecuteEngineUsingDbProviderAndConfig() {
        ServiceResult result = engine.execute(ServiceType.SHIPPING, Map.of("zip", "01001000"), "prod");

        assertTrue(result.success());
        assertEquals("J3", result.providerCode());
        assertEquals("ok", result.payload().get("status"));
        assertEquals(13.0, ((Number) result.payload().get("usedRate")).doubleValue());
    }

    @TestConfiguration
    static class TestDriversConfig {
        @Bean
        public ServiceDriver stubShippingJ3Driver() {
            return new ServiceDriver() {
                @Override public String driverKey() { return "shipping.j3"; }
                @Override public ServiceType serviceType() { return ServiceType.SHIPPING; }

                @Override
                public Map<String, Object> execute(Map<String, Object> request, Map<String, Object> config) {
                    return Map.of(
                            "status", "ok",
                            "usedRate", config.get("rate")
                    );
                }
            };
        }
    }
}
